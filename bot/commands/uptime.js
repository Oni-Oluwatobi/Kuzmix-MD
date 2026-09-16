/**
 * Kuzmix-MD Command: .uptime
 * Category: system
 * Description: Show bot uptime
 */

module.exports = {
  name: 'uptime',
  aliases: ["runtime"],
  category: 'system',
  description: 'Show bot uptime',
  usage: '.uptime',
  example: '.uptime',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'uptime';
    const desc = 'Show bot uptime';
    const syntax = '.uptime';
    const example = '.uptime';
    const nameUpper = 'UPTIME';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    return reply(
      `╔═════『 *BOT UPTIME* 』═════\n` +
      `║ ⏱️ *Active Runtime:* ${d} Days, ${h} Hours, ${m} Minutes, ${s} Seconds\n` +
      `║ 🕒 *Started:* ${new Date(Date.now() - uptimeSec * 1000).toUTCString()}\n` +
      `╚════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
