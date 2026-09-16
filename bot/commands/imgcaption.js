/**
 * Kuzmix-MD Command: .imgcaption
 * Category: vision
 * Description: Generate catchy caption for image
 */

module.exports = {
  name: 'imgcaption',
  aliases: [],
  category: 'vision',
  description: 'Generate catchy caption for image',
  usage: '.imgcaption',
  example: '.imgcaption',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'imgcaption';
    const desc = 'Generate catchy caption for image';
    const syntax = '.imgcaption';
    const example = '.imgcaption';
    const nameUpper = 'IMGCAPTION';

    
    const query = args.join(' ').trim() || 'Generate catchy caption for image';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Generate catchy caption for image\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
