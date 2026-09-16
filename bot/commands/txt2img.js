/**
 * Kuzmix-MD Command: .txt2img
 * Category: aimedia
 * Description: Text-to-image synthesizer using FLUX.1 model
 */

module.exports = {
  name: 'txt2img',
  aliases: ["genimg", "photogen"],
  category: 'aimedia',
  description: 'Text-to-image synthesizer using FLUX.1 model',
  usage: '.txt2img ancient temple hidden in rainforest, cinematic lighting',
  example: '.txt2img ancient temple hidden in rainforest, cinematic lighting',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🖼️ *Text-to-Image (.txt2img)*\n\n` +
        `Usage: \`.txt2img <prompt>\`\n` +
        `Example: \`.txt2img ancient temple hidden in rainforest, cinematic lighting\`\n\n` +
        `_Direct text-to-image using FLUX.1._`
      );
    }

    await reply(`🖼️ *Generating image...*\n_Prompt: ${prompt}_`);

    try {
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;
      const buffer = await getBuffer(imgUrl, { timeout: 30000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `╔═════『 *TEXT-TO-IMAGE* 』═════\n` +
        `┃ 🖼️ *Prompt:* ${prompt}\n` +
        `┃ ⚡ *Model:* FLUX.1 (Pollinations.ai)\n` +
        `┃ 📐 *Resolution:* 1024×1024 px\n` +
        `╚══════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
