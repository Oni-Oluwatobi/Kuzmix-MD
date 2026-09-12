module.exports = {
  name: 'owner',
  aliases: ['creator', 'developer'],
  category: 'General',
  description: 'Sends the bot owner contact info',
  usage: '.owner',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;
    const ownersList = config.owner.map(num => `• https://wa.me/${num}`).join('\n') || '• No owner numbers configured';

    const text =
      `👑 *${config.botName} Official Developer*\n\n` +
      `• *Name:* ${config.developerName}\n` +
      `• *Organization:* ${config.organization}\n` +
      `• *Verified Contacts:*\n${ownersList}\n\n` +
      `_Feel free to reach out for inquiries or bot features!_`;

    await reply(text);
  },
};
