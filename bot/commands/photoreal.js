/**
 * Kuzmix-MD Command: .photoreal
 * Category: aimedia
 * Description: Photorealistic image generator using FLUX.1 model
 */

module.exports = {
  name: 'photoreal',
  aliases: [],
  category: 'aimedia',
  description: 'Photorealistic image generator using FLUX.1 model',
  usage: '.photoreal elderly fisherman smiling at sunset, 85mm lens',
  example: '.photoreal elderly fisherman smiling at sunset, 85mm lens',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `📸 *Photorealistic Generator (.photoreal)*\n\n` +
        `Usage: \`.photoreal <prompt>\`\n` +
        `Example: \`.photoreal elderly fisherman smiling at sunset, 85mm lens\`\n\n` +
        `_Ultra-photorealistic output via FLUX.1._`
      );
    }

    await reply(`📸 *Generating photorealistic image...*\n_Prompt: ${prompt}_`);

    try {
      const enhanced = prompt + ', 8k photorealistic, 85mm portrait, national geographic lighting, sharp focus';
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;
      const buffer = await getBuffer(imgUrl, { timeout: 30000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `╔═════『 *PHOTOREALISTIC IMAGE* 』═════\n` +
        `┃ 📸 *Prompt:* ${prompt}\n` +
        `┃ ⚡ *Model:* FLUX.1 Photoreal (Pollinations.ai)\n` +
        `┃ 📐 *Resolution:* 1024×1024 px\n` +
        `╚══════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
