/**
 * Kuzmix-MD Command: .vid
 * Category: aimedia
 * Description: Generate AI video from text prompt
 */

module.exports = {
  name: 'vid',
  aliases: [],
  category: 'aimedia',
  description: 'Generate AI video from text prompt',
  usage: '.vid sports car drifting through neon rain',
  example: '.vid sports car drifting through neon rain',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎬 *AI Video Generator*\n\n` +
        `Usage: \`.vid <prompt>\`\n` +
        `Example: \`.vid sports car drifting through neon rain\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎬 *Generating video...*\n_Prompt: ${prompt}_\n\nThis may take 30-60 seconds...`);

    try {
      const seed = Math.floor(Math.random() * 999999);
      const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?model=wan&width=800&height=450&duration=5&seed=${seed}`;

      // Download the video
      const buffer = await getBuffer(videoUrl, { timeout: 120000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid video');
      }

      // Verify it's actually a video (MP4 starts with ftyp)
      const header = buffer.slice(0, 12).toString('ascii');
      if (!header.includes('ftyp') && !header.includes('mdat') && !header.includes('moov')) {
        // Might be a redirect or error page, try sending as video anyway
        console.warn('[VID] Warning: buffer may not be valid MP4, header:', header);
      }

      const caption =
        `🎬 *Prompt:* ${prompt}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { video: buffer, mimetype: 'video/mp4', caption }, { quoted: msg });
    } catch (err) {
      console.error('[VID CMD ERROR]', err.message);
      return reply(`⚠️ *Video generation failed:* ${err.message}\n\n_Try a shorter prompt or try again later._`);
    }
  }
};
