/**
 * Kuzmix-MD Command: .repo
 * Category: system
 * Description: Show official repository
 */

module.exports = {
  name: 'repo',
  aliases: ["github","sc","source"],
  category: 'system',
  description: 'Show official repository',
  usage: '.repo',
  example: '.repo',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'repo';
    const desc = 'Show official repository';
    const syntax = '.repo';
    const example = '.repo';
    const nameUpper = 'REPO';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    return reply(
      `🌐 *Kuzmix-MD GitHub Repository*\n\n` +
      `📦 *Source Code:* https://github.com/thekreadivegalaxy/Kuzmix-MD\n` +
      `⭐ Star the repository to support ongoing development!\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
