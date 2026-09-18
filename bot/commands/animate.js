/**
 * Kuzmix-MD Command: .animate
 * Category: aimedia
 * Description: Animate a scene into a short video
 */

module.exports = {
  name: 'animate',
  aliases: ["i2v", "animateimg"],
  category: 'aimedia',
  description: 'Animate a scene into a short video',
  usage: '.animate golden hour sunlight through forest trees',
  example: '.animate golden hour sunlight through forest trees',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎬 *AI Video Animator*\n\n` +
        `Usage: \`.animate <scene description>\`\n` +
        `Example: \`.animate golden hour sunlight through forest trees\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎬 *Generating animated video...*\n_Prompt: ${prompt}_\n\nThis may take 30-60 seconds...`);

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
      console.error('[ANIMATE CMD ERROR]', err.message);
      return reply(`⚠️ *Video generation failed:* ${err.message}\n\n_Try again later._`);
    }
  }
};
