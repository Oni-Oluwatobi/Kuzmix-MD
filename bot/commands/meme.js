/**
 * Kuzmix-MD Command: .meme
 * Category: media
 * Description: Create meme with top and bottom captions
 */

module.exports = {
  name: 'meme',
  aliases: [],
  category: 'media',
  description: 'Create meme with top and bottom captions',
  usage: '.meme Top text | Bottom text',
  example: '.meme Top text | Bottom text',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'meme';
    const desc = 'Create meme with top and bottom captions';
    const syntax = '.meme Top text | Bottom text';
    const example = '.meme Top text | Bottom text';
    const nameUpper = 'MEME';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Create meme with top and bottom captions\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
