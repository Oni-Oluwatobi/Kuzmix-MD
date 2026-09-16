/**
 * Kuzmix-MD Command: .watermark
 * Category: media
 * Description: Overlay custom watermark text on image
 */

module.exports = {
  name: 'watermark',
  aliases: [],
  category: 'media',
  description: 'Overlay custom watermark text on image',
  usage: '.watermark Kuzmix-MD',
  example: '.watermark Kuzmix-MD',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'watermark';
    const desc = 'Overlay custom watermark text on image';
    const syntax = '.watermark Kuzmix-MD';
    const example = '.watermark Kuzmix-MD';
    const nameUpper = 'WATERMARK';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Overlay custom watermark text on image\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
