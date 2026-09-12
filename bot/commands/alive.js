const os = require('os');
const { formatUptime } = require('../lib/helpers');

module.exports = {
  name: 'alive',
  aliases: ['status', 'info', 'bot'],
  category: 'General',
  description: 'Shows bot status, uptime, system load, and developer branding',
  usage: '.alive',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;
    const uptimeStr = formatUptime(process.uptime());
    const totalMem = Math.round(os.totalmem() / (1024 * 1024));
    const freeMem = Math.round(os.freemem() / (1024 * 1024));
    const usedMem = totalMem - freeMem;

    const message =
      `╔═════『 *${config.botName.toUpperCase()}* 』═════\n` +
      `║ ⚡ *Status:* Online & Synchronized\n` +
      `║ ⏱️ *Uptime:* ${uptimeStr}\n` +
      `║ 👨‍💻 *Developer:* ${config.developerName}\n` +
      `║ 🏢 *Organization:* ${config.organization}\n` +
      `║ 📟 *RAM Usage:* ${usedMem}MB / ${totalMem}MB\n` +
      `║ ⚙️ *Prefix:* ${config.prefix}\n` +
      `║ 🛡️ *Unknown Mode:* ${config.unknownCommandMode}\n` +
      `╚═══════════════════════\n\n` +
      `_${config.watermark}_`;

    await reply(message);
  },
};
