/**
 * Kuzmix-MD Command: .document
 * Category: vision
 * Description: Analyze and extract info from document
 */

module.exports = {
  name: 'document',
  aliases: [],
  category: 'vision',
  description: 'Analyze and extract info from document',
  usage: '.document',
  example: '.document',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'document';
    const desc = 'Analyze and extract info from document';
    const syntax = '.document';
    const example = '.document';
    const nameUpper = 'DOCUMENT';

    
    const query = args.join(' ').trim() || 'Analyze and extract info from document';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Analyze and extract info from document\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
