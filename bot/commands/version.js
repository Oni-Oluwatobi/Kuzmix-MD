/**
 * Kuzmix-MD Command: .version
 * Category: system
 * Description: Show Kuzmix-MD version
 */

module.exports = {
  name: 'version',
  aliases: ["v","ver"],
  category: 'system',
  description: 'Show Kuzmix-MD version',
  usage: '.version',
  example: '.version',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'version';
    const desc = 'Show Kuzmix-MD version';
    const syntax = '.version';
    const example = '.version';
    const nameUpper = 'VERSION';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    return reply(
      `╔═════『 *KUZMIX-MD VERSION* 』═════\n` +
      `║ 🚀 *Version:* 2.0.0 (Production Release)\n` +
      `║ 🔌 *Core Engine:* @whiskeysockets/baileys ^6.7.12\n` +
      `║ 👨‍💻 *Developer:* ${config.developerName}\n` +
      `║ 🏢 *Organization:* ${config.organization}\n` +
      `╚═════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
