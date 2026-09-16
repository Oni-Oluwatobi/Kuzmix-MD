/**
 * Kuzmix-MD Command: .imageask
 * Category: vision
 * Description: Ask AI a question about a replied image
 */

module.exports = {
  name: 'imageask',
  aliases: [],
  category: 'vision',
  description: 'Ask AI a question about a replied image',
  usage: '.imageask what breed is this dog?',
  example: '.imageask what breed is this dog?',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'imageask';
    const desc = 'Ask AI a question about a replied image';
    const syntax = '.imageask what breed is this dog?';
    const example = '.imageask what breed is this dog?';
    const nameUpper = 'IMAGEASK';

    
    const query = args.join(' ').trim() || 'Ask AI a question about a replied image';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Ask AI a question about a replied image\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
