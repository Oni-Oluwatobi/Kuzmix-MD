/**
 * Kuzmix-MD Command: .removebg
 * Category: media
 * Description: Remove image background transparently
 */

module.exports = {
  name: 'removebg',
  aliases: [],
  category: 'media',
  description: 'Remove image background transparently',
  usage: '.removebg',
  example: '.removebg',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'removebg';
    const desc = 'Remove image background transparently';
    const syntax = '.removebg';
    const example = '.removebg';
    const nameUpper = 'REMOVEBG';

    
    return reply(
      `🖼️ *Media & Sticker Studio (.${name})*\n\n` +
      `• *Feature:* Remove image background transparently\n` +
      `• *How to use:* Reply to an image, video, or sticker with \`${config.prefix}${name}\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
