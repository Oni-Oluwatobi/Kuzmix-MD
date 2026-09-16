/**
 * Kuzmix-MD Inspirational Quote Command (.quote / .inspire)
 * Delivers timeless wisdom and daily motivation
 */

module.exports = {
  name: 'quote',
  aliases: ['inspire', 'motivation', 'wisdom'],
  category: 'Creative',
  description: 'Shares an inspiring thought or philosophical quote',
  usage: '.quote',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;

    const fallbackQuotes = [
      { content: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { content: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { content: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
      { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
      { content: "The best way to predict the future is to invent it.", author: "Alan Kay" },
    ];

    try {
      const { getJson } = require('../lib/httpClient');
      const data = await getJson('https://api.quotable.io/random', { timeout: 6000 });
      if (data?.content && data?.author) {
        const msg =
          `✨ *KUZMIX DAILY INSPIRATION*\n\n` +
          `“${data.content}”\n\n` +
          `— *${data.author}*\n\n` +
          `_${config.watermark}_`;
        return reply(msg);
      }
    } catch (_) {}

    const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    const msg =
      `✨ *KUZMIX DAILY INSPIRATION*\n\n` +
      `“${q.content}”\n\n` +
      `— *${q.author}*\n\n` +
      `_${config.watermark}_`;
    await reply(msg);
  },
};
