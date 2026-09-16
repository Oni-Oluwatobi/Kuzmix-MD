/**
 * Kuzmix-MD Command: .compress
 * Category: media
 * Description: Compress media to reduce file size
 */

module.exports = {
  name: 'compress',
  aliases: [],
  category: 'media',
  description: 'Compress media to reduce file size',
  usage: '.compress',
  example: '.compress',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'compress';
    const desc = 'Compress media to reduce file size';
    const syntax = '.compress';
    const example = '.compress';
    const nameUpper = 'COMPRESS';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Compress media to reduce file size\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
