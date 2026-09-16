/**
 * Kuzmix-MD Command: .take / .wm
 * Category: Media & Download
 * Description: Re-creates sticker with custom pack / author branding
 */

const { extractMediaInfo, downloadMedia } = require('../lib/mediaHelper');

module.exports = {
  name: 'take',
  aliases: ['wm', 'steal', 'rename'],
  category: 'Media & Download',
  description: 'Re-watermarks or claims a sticker with custom metadata',
  usage: '.take [packname | author]',
  example: '.take Kuzmix | Dev',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;

    const mediaInfo = extractMediaInfo(msg);

    if (!mediaInfo || (mediaInfo.type !== 'sticker' && mediaInfo.type !== 'image')) {
      return reply(
        `🏷️ *${config.botName} Sticker Watermark & Take*\n\n` +
        `• Reply to any sticker or image with \`${config.prefix}take MyPack | MyAuthor\`\n` +
        `• Re-creates the sticker under your custom branding.\n\n` +
        `_${config.watermark}_`
      );
    }

    const brand = args.join(' ').trim() || `${config.botName} | ${config.developerName}`;
    await reply(`🏷️ *Re-branding sticker with:* _"${brand}"_...`);

    try {
      const buffer = await downloadMedia(mediaInfo, sock, msg);

      if (!buffer || buffer.length === 0) {
        throw new Error('Downloaded sticker buffer was empty.');
      }

      await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
    } catch (err) {
      console.error('[TAKE CMD ERROR]', err.message);
      await reply(`⚠️ *Could not re-watermark sticker:* ${err.message}`);
    }
  },
};
