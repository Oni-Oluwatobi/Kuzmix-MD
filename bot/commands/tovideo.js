/**
 * Kuzmix-MD Command: .tovideo
 * Category: Media & Download
 * Description: Convert animated sticker or gif to MP4 video
 */

const { extractMediaInfo, downloadMedia } = require('../lib/mediaHelper');

module.exports = {
  name: 'tovideo',
  aliases: ['tomp4', 'tovoffline'],
  category: 'Media & Download',
  description: 'Convert animated sticker or gif to MP4 video',
  usage: '.tovideo (reply to animated sticker or video)',
  example: '.tovideo',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const mediaInfo = extractMediaInfo(msg);

    if (!mediaInfo || (mediaInfo.type !== 'sticker' && mediaInfo.type !== 'video')) {
      return reply(
        `🎥 *${config.botName} Video Converter*\n\n` +
        `• Reply to any animated sticker or short video with \`${config.prefix}tovideo\`\n` +
        `• The bot will convert it to a playable MP4 video.\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply('🎥 *Processing video stream...*');

    try {
      const buffer = await downloadMedia(mediaInfo, sock, msg);

      if (!buffer || buffer.length === 0) {
        throw new Error('Downloaded buffer was empty.');
      }

      await sock.sendMessage(
        from,
        {
          video: buffer,
          caption: `🎥 *Video Extracted*\n🤖 *Engine:* ${config.botName}\n\n_${config.watermark}_`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error('[TOVIDEO CMD ERROR]', err.message);
      await reply(`⚠️ *Could not convert to video:* ${err.message}`);
    }
  },
};
