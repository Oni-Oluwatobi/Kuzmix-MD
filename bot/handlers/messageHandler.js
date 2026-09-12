const config = require('../config');
const commandHandler = require('./commandHandler');
const database = require('../database');

async function handleMessage(sock, m) {
  try {
    if (!m.messages || !m.messages[0]) return;
    const msg = m.messages[0];
    if (!msg.message) return;
    if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? (msg.key.participant || msg.participant) : from;
    const fromMe = Boolean(msg.key.fromMe);

    const messageType = Object.keys(msg.message)[0];
    let body = '';

    if (messageType === 'conversation') {
      body = msg.message.conversation;
    } else if (messageType === 'extendedTextMessage') {
      body = msg.message.extendedTextMessage.text;
    } else if (messageType === 'imageMessage') {
      body = msg.message.imageMessage.caption || '';
    } else if (messageType === 'videoMessage') {
      body = msg.message.videoMessage.caption || '';
    }

    body = String(body || '').trim();
    if (!body) return;

    const prefix = config.prefix || '.';
    const isCommand = body.startsWith(prefix);

    const reply = async (text, options = {}) => {
      return sock.sendMessage(from, { text, ...options }, { quoted: msg });
    };

    const senderNumber = String(sender || '').replace(/\D/g, '');
    const isOwner = fromMe || config.owner.includes(senderNumber);

    if (config.mode === 'private' && isGroup && !isOwner) return;
    if (config.mode === 'groups-only' && !isGroup && !isOwner) return;

    if (isCommand) {
      const args = body.slice(prefix.length).trim().split(/\s+/);
      const commandTrigger = args.shift()?.toLowerCase() || '';

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
          sender,
          senderNumber,
          isGroup,
          isOwner,
          fromMe,
          command: cmd.name,
          args,
          body,
          reply,
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
        const mode = config.unknownCommandMode || 'silent';

        if (mode === 'notify') {
          await reply(`❓ *Unknown Command*: \`${prefix}${commandTrigger}\` is not recognized.\nType \`${prefix}menu\` for available commands.`);
        } else if (mode === 'help') {
          await reply(`🤖 *${config.botName} Unknown Command*\nCommand: \`${prefix}${commandTrigger}\`\n\nType \`${prefix}menu\` to explore commands.`);
        } else if (mode === 'ai' && config.geminiApiKey) {
          try {
            const { GoogleGenAI } = require('@google/genai');
            const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
            const prompt = `You are ${config.botName}, developed by ${config.developerName}. Answer this briefly: ${body.slice(prefix.length)}`;
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            await reply(`✨ *${config.botName} AI:*\n\n${response.text}`);
          } catch (aiErr) {
            console.error('[KUZMIX AI] Error:', aiErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[KUZMIX] Message handler error:', err);
  }
}

module.exports = {
  handleMessage,
};
