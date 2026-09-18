/**
 * Kuzmix-MD Command: .flux
 * Category: aimedia
 * Description: Ultra-detailed image generator with cinematic style
 */

module.exports = {
  name: 'flux',
  aliases: [],
  category: 'aimedia',
  description: 'Ultra-detailed image generator with cinematic style',
  usage: '.flux glass bottle holding a glowing miniature galaxy',
  example: '.flux glass bottle holding a glowing miniature galaxy',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎨 *Ultra Image Generator*\n\n` +
        `Usage: \`.flux <prompt>\`\n` +
        `Example: \`.flux glass bottle holding a glowing miniature galaxy\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎨 *Generating ultra image...*\n_Prompt: ${prompt}_`);

    try {
      const enhanced = prompt + ', ultra detailed, cinematic masterpiece, sharp focus, vibrant colors';
      const seed = Math.floor(Math.random() * 999999);
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const buffer = await getBuffer(imgUrl, { timeout: 60000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `🎨 *Prompt:* ${prompt}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
