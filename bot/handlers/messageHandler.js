const config = require('../config');
const commandHandler = require('./commandHandler');
const database = require('../database');
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
      const userJid = rawSender || from;
      try {
        await sock.sendMessage(userJid, { text });
      } catch (_) {
        // If DM fails and we're in a DM already, send normally
        if (!isGroup) {
          await sock.sendMessage(from, { text }, { quoted: msg });
        }
      }
    };

    // Normal reply: sends in chat, or to DM if dmMode is on
    const reply = async (text, options = {}) => {
      if (dmMode && !isOwner) {
        return replyDM(text);
      }
      return sock.sendMessage(from, { text, ...options }, { quoted: msg });
    };

    console.log(`[KUZMIX MSG] ${isGroup ? 'GROUP' : 'DM'} from=${from} sender=${rawSender} body="${body.slice(0, 50)}"`);

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
      } else if (mode === 'ai' && (config.geminiApiKey || process.env.GEMINI_API_KEY)) {
        try {
          const { GoogleGenAI } = require('@google/genai');
          const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are ${config.botName}, developed by ${config.developerName}. Answer this briefly: ${body}`;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          await reply(`✨ *${config.botName} AI:*\n\n${response.text}`);
        } catch (aiErr) {
          console.error('[KUZMIX AI] Error:', aiErr.message);
        }
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
