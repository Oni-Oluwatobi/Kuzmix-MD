/**
 * Kuzmix-MD Command: .flip
 * Category: media
 * Description: Flip image horizontally or vertically
 */

module.exports = {
  name: 'flip',
  aliases: [],
  category: 'media',
  description: 'Flip image horizontally or vertically',
  usage: '.flip',
  example: '.flip',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'flip';
    const desc = 'Flip image horizontally or vertically';
    const syntax = '.flip';
    const example = '.flip';
    const nameUpper = 'FLIP';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Flip image horizontally or vertically\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
