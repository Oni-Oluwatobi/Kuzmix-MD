/**
 * Kuzmix-MD Command: .status
 * Category: system
 * Description: Show complete bot status
 */

module.exports = {
  name: 'status',
  aliases: ["state"],
  category: 'system',
  description: 'Show complete bot status',
  usage: '.status',
  example: '.status',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'status';
    const desc = 'Show complete bot status';
    const syntax = '.status';
    const example = '.status';
    const nameUpper = 'STATUS';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    const out =
      `╔═════『 *KUZMIX-MD STATUS* 』═════\n` +
      `║ 🤖 *Bot Name:* ${config.botName}\n` +
      `║ ⚡ *Mode:* ${config.mode.toUpperCase()}\n` +
      `║ ⚙️ *Prefix:* \`${config.prefix}\`\n` +
      `║ 🧠 *RAM:* ${mem} MB\n` +
      `║ ⏱️ *Uptime:* ${d}d ${h}h ${m}m\n` +
      `║ 🛡️ *Unknown Handler:* ${config.unknownCommandMode}\n` +
      `║ 📁 *Session:* ${config.sessionDir}\n` +
      `╚══════════════════════════════════\n\n` +
      `_${config.watermark}_`;
    return reply(out);
    

  }
};
