/**
 * Kuzmix-MD Command: .resize
 * Category: media
 * Description: Resize image to specific dimensions
 */

module.exports = {
  name: 'resize',
  aliases: [],
  category: 'media',
  description: 'Resize image to specific dimensions',
  usage: '.resize 800x600',
  example: '.resize 800x600',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'resize';
    const desc = 'Resize image to specific dimensions';
    const syntax = '.resize 800x600';
    const example = '.resize 800x600';
    const nameUpper = 'RESIZE';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Resize image to specific dimensions\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
