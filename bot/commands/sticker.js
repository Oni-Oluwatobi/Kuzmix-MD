/**
 * Kuzmix-MD Sticker Studio (.sticker / .s / .stiker)
 * Converts images, short videos, or stickers into WhatsApp stickers
 */

const { extractMediaInfo, downloadMedia } = require('../lib/mediaHelper');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick', 'stiker'],
  category: 'Media & Download',
  description: 'Converts an image or video to a WhatsApp sticker',
  usage: '.sticker (send with image or reply to image/video)',
  example: '.sticker',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const mediaInfo = extractMediaInfo(msg);

    if (!mediaInfo || (mediaInfo.type !== 'image' && mediaInfo.type !== 'video' && mediaInfo.type !== 'sticker')) {
      return reply(
        `🎨 *${config.botName} Sticker Studio*\n\n` +
        `• Send an image/video with caption \`${config.prefix}sticker\`\n` +
        `• Or reply to any image, sticker, or short video with \`${config.prefix}sticker\` or \`${config.prefix}s\`\n\n` +
        `💡 *Tips:* Supports PNG, JPG, WebP, and animated MP4/GIF.`
      );
    }

    await reply('🎨 *Converting media to sticker...*');

    try {
      const buffer = await downloadMedia(mediaInfo, sock, msg);

      if (!buffer || buffer.length === 0) {
        throw new Error('Downloaded media buffer was empty.');
      }

      // WhatsApp Multi-Device sends sticker directly as buffer
      await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
    } catch (err) {
      console.error('[STICKER CMD ERROR]', err.message);
      await reply(
        `⚠️ *Could not create sticker:* ${err.message || 'Processing error'}\n` +
        `_Ensure the image/video is valid and accessible._`
      );
    }
  },
};
