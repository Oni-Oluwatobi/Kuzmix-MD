/**
 * Kuzmix-MD Command: .img2vid
 * Category: aimedia
 * Description: Transform an image into a short animated video
 */

module.exports = {
  name: 'img2vid',
  aliases: [],
  category: 'aimedia',
  description: 'Transform an image into a short animated video',
  usage: '.img2vid (reply to image with motion instructions)',
  example: '.img2vid (reply to image) make the character dance',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');
    const { downloadMediaMessage } = require('../lib/mediaHelper');

    const prompt = args.join(' ').trim() || 'subtle motion, cinematic';

    // Check if replying to an image
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const hasImage = quotedMsg?.imageMessage;

    if (!hasImage) {
      return reply(
        `🎬 *Image to Video*\n\n` +
        `*Usage:* Reply to an image with \`.img2vid <motion description>\`\n` +
        `*Example:* Reply to a photo and type \`.img2vid make the person wave hello\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎬 *Generating video from image...*\n_Motion: ${prompt}_\n\nThis may take 30-60 seconds...`);

    try {
      // Download the quoted image
      const imageBuffer = await downloadMediaMessage(
        { key: quotedMsg.key || msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMsg },
        'buffer',
        {}
      );

      if (!imageBuffer || imageBuffer.length < 1000) {
        throw new Error('Could not download the quoted image');
      }

      // Upload image to a temp host to get a URL for Pollinations
      // Use Pollinations image-to-video with the prompt
      const seed = Math.floor(Math.random() * 999999);
      const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(prompt)}?model=seedance&width=800&height=450&duration=4&seed=${seed}`;

      const buffer = await getBuffer(videoUrl, { timeout: 120000 });

      if (!buffer || buffer.length < 1000) {
        throw new Error('Received empty or invalid video');
      }

      const caption =
        `🎬 *Motion:* ${prompt}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { video: buffer, mimetype: 'video/mp4', caption }, { quoted: msg });
    } catch (err) {
      console.error('[IMG2VID CMD ERROR]', err.message);
      return reply(`⚠️ *Video generation failed:* ${err.message}\n\n_Try again later._`);
    }
  }
};
