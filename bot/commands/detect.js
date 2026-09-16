/**
 * Kuzmix-MD Command: .detect
 * Category: vision
 * Description: Detect objects/content in image
 */

module.exports = {
  name: 'detect',
  aliases: [],
  category: 'vision',
  description: 'Detect objects/content in image',
  usage: '.detect',
  example: '.detect',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'detect';
    const desc = 'Detect objects/content in image';
    const syntax = '.detect';
    const example = '.detect';
    const nameUpper = 'DETECT';

    
    const query = args.join(' ').trim() || 'Detect objects/content in image';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Detect objects/content in image\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
