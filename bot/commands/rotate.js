/**
 * Kuzmix-MD Command: .rotate
 * Category: media
 * Description: Rotate image by degrees
 */

module.exports = {
  name: 'rotate',
  aliases: [],
  category: 'media',
  description: 'Rotate image by degrees',
  usage: '.rotate 90',
  example: '.rotate 90',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'rotate';
    const desc = 'Rotate image by degrees';
    const syntax = '.rotate 90';
    const example = '.rotate 90';
    const nameUpper = 'ROTATE';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Rotate image by degrees\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
