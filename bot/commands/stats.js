/**
 * Kuzmix-MD Command: .stats
 * Category: system
 * Description: Show bot usage statistics
 */

module.exports = {
  name: 'stats',
  aliases: ["botstats"],
  category: 'system',
  description: 'Show bot usage statistics',
  usage: '.stats',
  example: '.stats',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'stats';
    const desc = 'Show bot usage statistics';
    const syntax = '.stats';
    const example = '.stats';
    const nameUpper = 'STATS';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    const cmdHandler = require('../handlers/commandHandler');
    return reply(
      `╔═════『 *BOT USAGE STATISTICS* 』═════\n` +
      `║ 📊 *Registered Commands:* ${cmdHandler.commands.size}\n` +
      `║ 🏷️ *Active Aliases:* ${cmdHandler.aliases.size}\n` +
      `║ 🧠 *Heap Utilization:* ${mem} MB\n` +
      `║ ⏱️ *System Uptime:* ${d}d ${h}h ${m}m\n` +
      `║ ⚡ *Active Mode:* ${config.mode}\n` +
      `╚══════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
