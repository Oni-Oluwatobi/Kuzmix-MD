/**
 * Kuzmix-MD Command: .describe
 * Category: vision
 * Description: Describe replied image in vivid detail
 */

module.exports = {
  name: 'describe',
  aliases: [],
  category: 'vision',
  description: 'Describe replied image in vivid detail',
  usage: '.describe',
  example: '.describe',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'describe';
    const desc = 'Describe replied image in vivid detail';
    const syntax = '.describe';
    const example = '.describe';
    const nameUpper = 'DESCRIBE';

    
    const query = args.join(' ').trim() || 'Describe replied image in vivid detail';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Describe replied image in vivid detail\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
