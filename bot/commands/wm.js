/**
 * Kuzmix-MD Command: .wm
 * Category: media
 * Description: Create sticker with custom watermark text
 */

module.exports = {
  name: 'wm',
  aliases: [],
  category: 'media',
  description: 'Create sticker with custom watermark text',
  usage: '.wm MyPack | Author',
  example: '.wm MyPack | Author',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'wm';
    const desc = 'Create sticker with custom watermark text';
    const syntax = '.wm MyPack | Author';
    const example = '.wm MyPack | Author';
    const nameUpper = 'WM';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Create sticker with custom watermark text\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
