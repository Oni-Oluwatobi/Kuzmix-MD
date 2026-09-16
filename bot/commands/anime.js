/**
 * Kuzmix-MD Command: .anime
 * Category: aimedia
 * Description: Anime-style image generator using FLUX.1 model
 */

module.exports = {
  name: 'anime',
  aliases: [],
  category: 'aimedia',
  description: 'Anime-style image generator using FLUX.1 model',
  usage: '.anime magical girl casting a spell in cherry blossom forest',
  example: '.anime magical girl casting a spell in cherry blossom forest',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎌 *Anime Image Generator (.anime)*\n\n` +
        `Usage: \`.anime <prompt>\`\n` +
        `Example: \`.anime magical girl casting a spell in cherry blossom forest\`\n\n` +
        `_Anime/manga style via FLUX.1._`
      );
    }

    await reply(`🎌 *Generating anime image...*\n_Prompt: ${prompt}_`);

    try {
      const enhanced = prompt + ', anime manga style, vibrant colors, detailed illustration, studio ghibli inspired';
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;
      const buffer = await getBuffer(imgUrl, { timeout: 30000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `╔═════『 *ANIME IMAGE GENERATOR* 』═════\n` +
        `┃ 🎌 *Prompt:* ${prompt}\n` +
        `┃ ⚡ *Model:* FLUX.1 Anime (Pollinations.ai)\n` +
        `┃ 📐 *Resolution:* 1024×1024 px\n` +
        `╚══════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
