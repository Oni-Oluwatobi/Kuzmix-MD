/**
 * Kuzmix-MD Jokes Command (.joke / .pun)
 * Fetches humorous jokes and witty puns
 */

module.exports = {
  name: 'joke',
  aliases: ['pun', 'funny'],
  category: 'Fun & Games',
  description: 'Delivers a witty, humorous joke or pun',
  usage: '.joke',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;

    const fallbackJokes = [
      { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!" },
      { setup: "Why do Java programmers have to wear glasses?", punchline: "Because they don't C#!" },
      { setup: "There are only 10 types of people in the world:", punchline: "Those who understand binary, and those who don't." },
      { setup: "What is a programmer's favorite hangout place?", punchline: "Foo Bar." },
      { setup: "Why was the mobile developer broke?", punchline: "Because he had too many widgets and not enough cache!" },
    ];

    try {
      const { getJson } = require('../lib/httpClient');
      const data = await getJson('https://official-joke-api.appspot.com/random_joke', { timeout: 6000 });
      if (data?.setup && data?.punchline) {
        const msg =
          `😂 *KUZMIX JOKE BOX*\n\n` +
          `*Q:* ${data.setup}\n\n` +
          `*A:* _${data.punchline}_\n\n` +
          `_${config.watermark}_`;
        return reply(msg);
      }
    } catch (_) {}

    const randomChoice = fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
    const msg =
      `😂 *KUZMIX JOKE BOX*\n\n` +
      `*Q:* ${randomChoice.setup}\n\n` +
      `*A:* _${randomChoice.punchline}_\n\n` +
      `_${config.watermark}_`;
    await reply(msg);
  },
};
