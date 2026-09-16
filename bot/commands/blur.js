/**
 * Kuzmix-MD Command: .blur
 * Category: media
 * Description: Apply blur effect to replied image
 */

module.exports = {
  name: 'blur',
  aliases: [],
  category: 'media',
  description: 'Apply blur effect to replied image',
  usage: '.blur',
  example: '.blur',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'blur';
    const desc = 'Apply blur effect to replied image';
    const syntax = '.blur';
    const example = '.blur';
    const nameUpper = 'BLUR';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Apply blur effect to replied image\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
