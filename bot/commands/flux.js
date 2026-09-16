/**
 * Kuzmix-MD Command: .flux
 * Category: aimedia
 * Description: Ultra-detailed FLUX.1 image generator with cinematic style
 */

module.exports = {
  name: 'flux',
  aliases: [],
  category: 'aimedia',
  description: 'Ultra-detailed FLUX.1 image generator with cinematic style',
  usage: '.flux glass bottle holding a glowing miniature galaxy',
  example: '.flux glass bottle holding a glowing miniature galaxy',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎨 *FLUX Image Generator (.flux)*\n\n` +
        `Usage: \`.flux <prompt>\`\n` +
        `Example: \`.flux glass bottle holding a glowing miniature galaxy\`\n\n` +
        `_Ultra-detailed cinematic quality._`
      );
    }

    await reply(`🎨 *Generating with FLUX.1 Ultra...*\n_Prompt: ${prompt}_`);

    try {
      const enhanced = prompt + ', ultra detailed, cinematic masterpiece, sharp focus, vibrant colors';
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;
      const buffer = await getBuffer(imgUrl, { timeout: 30000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `╔═════『 *FLUX ULTRA GENERATOR* 』═════\n` +
        `┃ 🎨 *Prompt:* ${prompt}\n` +
        `┃ ⚡ *Model:* FLUX.1 Ultra (Pollinations.ai)\n` +
        `┃ 📐 *Resolution:* 1024×1024 px\n` +
        `╚══════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
