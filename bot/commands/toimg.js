/**
 * Kuzmix-MD Command: .toimg
 * Category: Media & Download
 * Description: Convert sticker to JPG/PNG image
 */

const { extractMediaInfo, downloadMedia } = require('../lib/mediaHelper');

module.exports = {
  name: 'toimg',
  aliases: ['tophoto', 'stickertoimg'],
  category: 'Media & Download',
  description: 'Convert a sticker to an image photo',
  usage: '.toimg (reply to a sticker)',
  example: '.toimg',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const mediaInfo = extractMediaInfo(msg);

    if (!mediaInfo || (mediaInfo.type !== 'sticker' && mediaInfo.type !== 'image')) {
      return reply(
        `🖼️ *${config.botName} Sticker to Image Converter*\n\n` +
        `• Reply to any sticker with \`${config.prefix}toimg\`\n` +
        `• The bot will convert the sticker and send it as a standard photo.\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply('🖼️ *Converting sticker to image...*');

    try {
      const buffer = await downloadMedia(mediaInfo, sock, msg);

      if (!buffer || buffer.length === 0) {
        throw new Error('Downloaded sticker buffer was empty.');
      }

      await sock.sendMessage(
        from,
        {
          image: buffer,
          caption: `🖼️ *Sticker Converted to Image*\n🤖 *Engine:* ${config.botName}\n\n_${config.watermark}_`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error('[TOIMG CMD ERROR]', err.message);
      await reply(`⚠️ *Could not convert sticker to image:* ${err.message}`);
    }
  },
};
