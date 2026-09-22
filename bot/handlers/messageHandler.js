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

/**
 * Try to find a command name inside a sentence (without prefix).
 * Returns { command, args } or null.
 */
function detectCommandInSentence(text, commandHandler) {
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const clean = words[i].replace(/[^a-z0-9]/g, '');
    const cmd = commandHandler.getCommand(clean);
    if (cmd) {
      const args = words.slice(i + 1);
      return { command: clean, args, cmd };
    }
  }
  return null;
}

async function handleMessage(sock, m) {
  try {
    if (!m.messages || !m.messages[0]) return;
    const msg = m.messages[0];
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const rawSender = isGroup ? (msg.key.participant || msg.participant) : from;
    const fromMe = Boolean(msg.key.fromMe);

    let body = extractMessageText(msg);
    body = String(body || '').trim();
    if (!body) return;

    const prefix = config.prefix || '.';
    const dmMode = config.unknownCommandMode === 'private';

    const senderNumber = String(rawSender || '').split('@')[0].split(':')[0].replace(/\D/g, '');
    const isOwner = fromMe || (Array.isArray(config.owner) && config.owner.some(o => String(o).replace(/\D/g, '') === senderNumber));

    // Private mode: only respond to the owner/connected person
    if (config.privateMode && !isOwner && !fromMe) {
      return;
    }

    // Mode filters
    if (config.mode === 'private' && isGroup && !isOwner) return;
    if (config.mode === 'groups-only' && !isGroup && !isOwner) return;

    // DM reply: always sends to user's DM (for dmMode)
    const replyDM = async (text) => {
      // Build proper DM JID: strip :xxx suffix, replace @g.us with @s.whatsapp.net
      let dmJid = rawSender || from;
      dmJid = dmJid.replace(/:.+@/, '@').replace('@g.us', '@s.whatsapp.net');
      if (!dmJid.endsWith('@s.whatsapp.net')) {
        dmJid = dmJid.split('@')[0] + '@s.whatsapp.net';
      }
      try {
        await sock.sendMessage(dmJid, { text });
      } catch (dmErr) {
        console.warn('[KUZMIX] DM send failed, falling back to chat:', dmErr.message);
        // Last resort: send in chat (quoted)
        if (isGroup) {
          await sock.sendMessage(from, { text }, { quoted: msg });
        }
      }
    };

    // Normal reply: sends in chat, or to ALL users' DMs if dmMode is on
    const reply = async (text, options = {}) => {
      if (dmMode) {
        return replyDM(text);
      }
      const sentMsg = await sock.sendMessage(from, { text, ...options }, { quoted: msg });
      if (sentMsg?.key) messageStore.track(from, sentMsg.key);
      return sentMsg;
    };

    console.log(`[KUZMIX MSG] ${isGroup ? 'GROUP' : 'DM'} from=${from} sender=${rawSender} body="${body.slice(0, 50)}"`);

    // Track user in database
    try {
      const users = database.get('users', {});
      const userKey = senderNumber;
      if (!users[userKey]) {
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
      users[userKey].lastSeen = Date.now();
      users[userKey].messages = (users[userKey].messages || 0) + 1;
      if (isOwner) users[userKey].isOwner = true;
      if (isGroup && !users[userKey].groups.includes(from)) {
        users[userKey].groups.push(from);
      }
      database.set('users', users);
    } catch (_) {}

    // --- 1. Check for prefix command (.play something) ---
    const isPrefixed = body.startsWith(prefix);
    let commandTrigger = '';
    let args = [];

    if (isPrefixed) {
      const trimmedBody = body.slice(prefix.length).trim();
      const parts = trimmedBody.split(/\s+/);
      commandTrigger = parts.shift()?.toLowerCase() || '';
      args = parts;
    } else {
      // --- 2. Try to detect command in sentence (play something / hey bot play song) ---
      const detected = detectCommandInSentence(body, commandHandler);
      if (detected) {
        commandTrigger = detected.command;
        args = detected.args;
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
        sock,
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
        await reply(`⚠️ *Error executing .${cmd.name}*: ${execErr.message}`);
      }
    } else {
      // Unknown command handling
      const mode = config.unknownCommandMode || 'notify';

      if (mode === 'private') {
        await replyDM(`❓ *Unknown Command*: \`${commandTrigger}\` is not recognized.\nType \`menu\` for available commands.`);
      } else if (mode === 'notify') {
        await reply(`❓ *Unknown Command*: \`${prefix}${commandTrigger}\` is not recognized.\nType \`${prefix}menu\` for available commands.`);
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
