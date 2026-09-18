/**
 * Kuzmix-MD Command: .genvideo
 * Category: aimedia
 * Description: Generate AI video from text prompt
 */

module.exports = {
  name: 'genvideo',
  aliases: ["videoai", "txt2video", "t2v", "cinematic"],
  category: 'aimedia',
  description: 'Generate AI video from text prompt',
  usage: '.genvideo golden eagle soaring over snowy mountain peaks',
  example: '.genvideo golden eagle soaring over snowy mountain peaks',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎬 *AI Video Generator*\n\n` +
        `Usage: \`.genvideo <prompt>\`\n` +
        `Example: \`.genvideo golden eagle soaring over snowy mountain peaks\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎬 *Generating video...*\n_Prompt: ${prompt}_\n\nThis may take 30-60 seconds...`);

    try {
      const seed = Math.floor(Math.random() * 999999);
      const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?model=wan&width=800&height=450&duration=5&seed=${seed}`;

      const buffer = await getBuffer(videoUrl, { timeout: 120000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid video');
      }

      const caption =
        `🎬 *Prompt:* ${prompt}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { video: buffer, mimetype: 'video/mp4', caption }, { quoted: msg });
    } catch (err) {
      console.error('[GENVIDEO CMD ERROR]', err.message);
      return reply(`⚠️ *Video generation failed:* ${err.message}\n\n_Try a shorter prompt or try again later._`);
    }
  }
};
