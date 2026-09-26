const config = require('../config');
const commandHandler = require('./commandHandler');
const database = require('../database');
const messageStore = require('../lib/messageStore');
const { unwrapMessage } = require('../lib/mediaHelper');

function extractMessageText(msg) {
  if (!msg || !msg.message) return '';
  const m = unwrapMessage(msg);
  if (!m) return '';

  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.buttonsResponseMessage?.selectedDisplayText ||
    m.templateButtonReplyMessage?.selectedId ||
    m.templateButtonReplyMessage?.selectedDisplayText ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.interactiveResponseMessage?.body?.text ||
    ''
  );
}

function extractNumber(jid) {
  return String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '');
}

function deriveDMJid(rawSender) {
  let jid = String(rawSender || '');
  jid = jid.replace(/:.+@/, '@').replace('@g.us', '@s.whatsapp.net');
  if (!jid.endsWith('@s.whatsapp.net')) {
    jid = jid.split('@')[0] + '@s.whatsapp.net';
  }
  return jid;
}

async function handleMessage(sock, m) {
  try {
    if (!m.messages || !m.messages[0]) return;
    const msg = m.messages[0];
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

    // Dedup + self-echo protection (before any other processing)
    const msgId = msg.key && msg.key.id;
    if (msgId) {
      if (!messageStore.markSeen(msgId)) return;
      if (messageStore.wasSent(msgId)) return;
    }

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const rawSender = isGroup ? (msg.key.participant || msg.participant) : from;
    const fromMe = Boolean(msg.key.fromMe);

    let senderNumber = extractNumber(rawSender);
    if (fromMe && sock.user && sock.user.id) {
      const ownNumber = extractNumber(sock.user.id);
      if (ownNumber) senderNumber = ownNumber;
    }
    const isOwner = Boolean(senderNumber) &&
      Array.isArray(config.owner) &&
      config.owner.some(o => String(o) === senderNumber);

    // The paired account itself is the operator of its own session: commands
    // it sends (synced from its own primary device) must always pass the gates.
    // Owner-only commands (exec/eval/pair/...) still require config.owner.
    const ownNumber = sock.user ? extractNumber(sock.user.id) : '';
    const isSessionOperator = Boolean(senderNumber) && Boolean(ownNumber) &&
      senderNumber === ownNumber;
    const passesGates = isOwner || isSessionOperator;

    // --- Safety gates (fail closed, before body is even parsed) ---
    // Groups: silent unless public mode is on (session operator always allowed)
    if (isGroup && !config.publicMode && !passesGates) return;
    // DMs: private mode = session operator only
    if (!isGroup && config.privateMode && !passesGates) return;
    // Legacy mode filters
    if (config.mode === 'private' && isGroup && !passesGates) return;
    if (config.mode === 'groups-only' && !isGroup && !passesGates) return;

    let body = extractMessageText(msg);
    body = String(body || '').trim();
    if (!body) return;

    const prefix = config.prefix || '.';
    const dmMode = config.unknownCommandMode === 'private';

    // DM redirect: when DM-only mode is on in a group, all replies go to the requester's DM
    let effectiveSock = sock;
    const dmJid = deriveDMJid(rawSender);
    if (dmMode && isGroup) {
      effectiveSock = Object.create(sock);
      effectiveSock.sendMessage = (jid, content, options) => {
        if (jid === from) {
          return sock.sendMessage(dmJid, content);
        }
        return sock.sendMessage(jid, content, options);
      };
    }

    const replyDM = async (text) => {
      try {
        await sock.sendMessage(dmJid, { text });
      } catch (dmErr) {
        console.warn('[KUZMIX] DM send failed:', dmErr.message);
      }
    };

    const reply = async (text, options = {}) => {
      const sentMsg = await effectiveSock.sendMessage(from, { text, ...options }, { quoted: msg });
      const destJid = (dmMode && isGroup) ? dmJid : from;
      if (sentMsg && sentMsg.key) messageStore.track(destJid, sentMsg.key);
      return sentMsg;
    };

    // Track user in database (only for messages that passed all gates)
    try {
      const users = database.get('users', {});
      const userKey = senderNumber;
      if (userKey && !users[userKey]) {
        users[userKey] = {
          jid: rawSender,
          number: senderNumber,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          messages: 0,
          isOwner: isOwner,
          groups: [],
        };
      }
      if (userKey) {
        users[userKey].lastSeen = Date.now();
        users[userKey].messages = (users[userKey].messages || 0) + 1;
        if (isOwner) users[userKey].isOwner = true;
        if (isGroup && !users[userKey].groups.includes(from)) {
          users[userKey].groups.push(from);
        }
        database.set('users', users);
      }
    } catch (_) {}

    // --- Exact command parsing (no fuzzy word scanning) ---
    const isPrefixed = body.startsWith(prefix);
    let commandTrigger = '';
    let args = [];

    if (isPrefixed) {
      const trimmedBody = body.slice(prefix.length).trim();
      const parts = trimmedBody.split(/\s+/);
      commandTrigger = parts.shift()?.toLowerCase() || '';
      args = parts;
    } else if (!config.strictMode) {
      // Non-strict: the entire message must EQUAL a registered command name/alias (no args)
      const lower = body.toLowerCase();
      if (commandHandler.getCommand(lower)) {
        commandTrigger = lower;
        args = [];
      }
    }

    if (!commandTrigger) return;

    const cmd = commandHandler.getCommand(commandTrigger);

    if (cmd) {
      if (cmd.permission === 'owner' && !isOwner) {
        return reply('⛔ *Access Denied*: This command is reserved exclusively for the bot owner.');
      }

      database.incrementCommandStat(cmd.name);

      const ctx = {
        sock: effectiveSock,
        msg,
        from,
        sender: rawSender,
        senderNumber,
        isGroup,
        isOwner,
        fromMe,
        command: cmd.name,
        args,
        body,
        reply,
        replyDM,
        config,
        database,
      };

      try {
        await cmd.execute(ctx);
      } catch (execErr) {
        console.error(`[KUZMIX] Error executing .${cmd.name}:`, execErr);
        await reply('❌ Command failed.');
      }
    } else {
      // Unknown command handling (default: silent)
      const mode = config.unknownCommandMode || 'silent';

      if (mode === 'private') {
        await replyDM(`❓ *Unknown Command*: \`${commandTrigger}\` is not recognized.`);
      } else if (mode === 'notify') {
        await reply(`❓ *Unknown Command*: \`${prefix}${commandTrigger}\` is not recognized.`);
      } else if (mode === 'help') {
        await reply(`🤖 *${config.botName} Unknown Command*\nCommand: \`${prefix}${commandTrigger}\`\n\nType \`${prefix}menu\` to explore commands.`);
      }
      // mode === 'silent' = do nothing
    }
  } catch (err) {
    console.error('[KUZMIX] Message handler error:', err);
  }
}

module.exports = {
  handleMessage,
  extractMessageText,
};
