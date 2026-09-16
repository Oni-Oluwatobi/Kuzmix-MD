/**
 * Kuzmix-MD Command: .ocr
 * Category: vision
 * Description: Extract printed/handwritten text from image
 */

module.exports = {
  name: 'ocr',
  aliases: [],
  category: 'vision',
  description: 'Extract printed/handwritten text from image',
  usage: '.ocr',
  example: '.ocr',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'ocr';
    const desc = 'Extract printed/handwritten text from image';
    const syntax = '.ocr';
    const example = '.ocr';
    const nameUpper = 'OCR';

    
    const query = args.join(' ').trim() || 'Extract printed/handwritten text from image';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Extract printed/handwritten text from image\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
