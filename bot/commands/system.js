/**
 * Kuzmix-MD Command: .system
 * Category: system
 * Description: Show CPU, RAM, OS, Node.js and system information
 */

module.exports = {
  name: 'system',
  aliases: ["sysinfo","host"],
  category: 'system',
  description: 'Show CPU, RAM, OS, Node.js and system information',
  usage: '.system',
  example: '.system',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'system';
    const desc = 'Show CPU, RAM, OS, Node.js and system information';
    const syntax = '.system';
    const example = '.system';
    const nameUpper = 'SYSTEM';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    const cpus = os.cpus().length;
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const out =
      `╔═════『 *HOST SYSTEM DIAGNOSTICS* 』═════\n` +
      `║ 💻 *OS:* ${os.type()} ${os.release()} (${os.arch()})\n` +
      `║ ⚙️ *CPUs:* ${cpus} Cores\n` +
      `║ 🧠 *RAM:* ${freeMem} GB free / ${totalMem} GB total\n` +
      `║ 📦 *Node.js:* ${process.version}\n` +
      `║ 📂 *PID:* ${process.pid}\n` +
      `╚═════════════════════════════════════════\n\n` +
      `_${config.watermark}_`;
    return reply(out);
    

  }
};
