module.exports = {
  name: 'ping',
  aliases: ['p', 'speed', 'latency'],
  category: 'General',
  description: 'Checks bot response latency and server speed',
  usage: '.ping',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;
    const start = Date.now();
    await reply('🏓 *Pinging WhatsApp Gateway...*');
    const latency = Date.now() - start;

    await reply(
      `🏓 *PONG!* \`${latency}ms\`\n\n` +
      `• *Bot:* ${config.botName}\n` +
      `• *Core:* Baileys Multi-Device (JavaScript)\n` +
      `• *Status:* 🟢 Operational`
    );
  },
};
