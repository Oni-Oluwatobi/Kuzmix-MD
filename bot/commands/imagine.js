/**
 * Kuzmix-MD Command: .imagine (.image)
 * Category: aimedia
 * Description: Generate AI image from text
 */

module.exports = {
  name: 'imagine',
  aliases: ["draw", "aiimg", "dalle"],
  category: 'aimedia',
  description: 'Generate AI image from text',
  usage: '.imagine futuristic cybernetic lion in neon savanna 8k',
  example: '.imagine futuristic cybernetic lion in neon savanna 8k',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎨 *AI Image Generator*\n\n` +
        `Usage: \`.image <prompt>\`\n` +
        `Example: \`.image futuristic cybernetic lion in neon savanna 8k\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎨 *Generating image...*\n_Prompt: ${prompt}_`);

    try {
      const seed = Math.floor(Math.random() * 999999);
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
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
