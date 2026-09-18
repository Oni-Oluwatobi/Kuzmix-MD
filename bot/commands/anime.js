/**
 * Kuzmix-MD Command: .anime
 * Category: aimedia
 * Description: Anime-style image generator
 */

module.exports = {
  name: 'anime',
  aliases: [],
  category: 'aimedia',
  description: 'Anime-style image generator',
  usage: '.anime magical girl casting a spell in cherry blossom forest',
  example: '.anime magical girl casting a spell in cherry blossom forest',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎌 *Anime Image Generator*\n\n` +
        `Usage: \`.anime <prompt>\`\n` +
        `Example: \`.anime magical girl casting a spell in cherry blossom forest\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎌 *Generating anime image...*\n_Prompt: ${prompt}_`);

    try {
      const enhanced = prompt + ', anime manga style, vibrant colors, detailed illustration, studio ghibli inspired';
      const seed = Math.floor(Math.random() * 999999);
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const buffer = await getBuffer(imgUrl, { timeout: 60000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `🎌 *Prompt:* ${prompt}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
