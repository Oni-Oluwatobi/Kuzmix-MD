/**
 * Kuzmix-MD Command: .txt2img
 * Category: aimedia
 * Description: Text-to-image synthesizer
 */

module.exports = {
  name: 'txt2img',
  aliases: ["genimg", "photogen"],
  category: 'aimedia',
  description: 'Text-to-image synthesizer',
  usage: '.txt2img ancient temple hidden in rainforest, cinematic lighting',
  example: '.txt2img ancient temple hidden in rainforest, cinematic lighting',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🖼️ *Text-to-Image*\n\n` +
        `Usage: \`.txt2img <prompt>\`\n` +
        `Example: \`.txt2img ancient temple hidden in rainforest, cinematic lighting\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🖼️ *Generating image...*\n_Prompt: ${prompt}_`);

    try {
      const seed = Math.floor(Math.random() * 999999);
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      const buffer = await getBuffer(imgUrl, { timeout: 60000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `🖼️ *Prompt:* ${prompt}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`⚠️ *Image generation failed:* ${err.message}\n\n_Try again in a few seconds._`);
    }
  }
};
