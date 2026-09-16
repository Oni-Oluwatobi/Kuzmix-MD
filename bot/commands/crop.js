/**
 * Kuzmix-MD Command: .crop
 * Category: media
 * Description: Crop image to aspect ratio (1:1, 16:9, etc.)
 */

module.exports = {
  name: 'crop',
  aliases: [],
  category: 'media',
  description: 'Crop image to aspect ratio (1:1, 16:9, etc.)',
  usage: '.crop 1:1',
  example: '.crop 1:1',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'crop';
    const desc = 'Crop image to aspect ratio (1:1, 16:9, etc.)';
    const syntax = '.crop 1:1';
    const example = '.crop 1:1';
    const nameUpper = 'CROP';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Crop image to aspect ratio (1:1, 16:9, etc.)\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
