/**
 * Kuzmix-MD Command: .imagine (.image)
 * Category: aimedia
 * Description: Generate HD AI image from text using FLUX.1 model
 */

module.exports = {
  name: 'imagine',
  aliases: ["image", "draw", "aiimg", "dalle"],
  category: 'aimedia',
  description: 'Generate HD AI image from text using FLUX.1 model',
  usage: '.imagine futuristic cybernetic lion in neon savanna 8k',
  example: '.imagine futuristic cybernetic lion in neon savanna 8k',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎨 *AI Image Generator (.image)*\n\n` +
        `Usage: \`.image <prompt>\`\n` +
        `Example: \`.image futuristic cybernetic lion in neon savanna 8k\`\n\n` +
        `_Powered by FLUX.1 model via Pollinations.ai_`
      );
    }

    await reply(`🎨 *Generating image with FLUX.1...*\n_Prompt: ${prompt}_`);

    try {
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;
      const buffer = await getBuffer(imgUrl, { timeout: 30000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const caption =
        `╔═════『 *AI IMAGE GENERATOR* 』═════\n` +
        `┃ 🎨 *Prompt:* ${prompt}\n` +
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
