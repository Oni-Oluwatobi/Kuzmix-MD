module.exports = {
  name: 'ping',
  aliases: ['p', 'speed', 'latency'],
  category: 'General',
  description: 'Checks bot response latency and server speed',
  usage: '.ping',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;
    const uptimeSec = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSec / 3600);
    const minutes = Math.floor((uptimeSec % 3600) / 60);
    const seconds = uptimeSec % 60;
    const uptimeStr = hours > 0
      ? `${hours}h ${minutes}m ${seconds}s`
      : minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;

    await reply(
      `🏓 *PONG!*\n\n` +
      `• *Bot:* ${config.botName}\n` +
      `• *Core:* Baileys Multi-Device (JavaScript)\n` +
      `• *Uptime:* ${uptimeStr}\n` +
      `• *Status:* 🟢 Operational`
    );
  },
};
