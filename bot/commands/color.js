/**
 * Kuzmix-MD Command: .color
 * Category: utilities
 * Description: Convert HEX, RGB, HSL color codes with preview
 */

module.exports = {
  name: 'color',
  aliases: [],
  category: 'utilities',
  description: 'Convert HEX, RGB, HSL color codes with preview',
  usage: '.color #3b82f6',
  example: '.color #3b82f6',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'color';
    const desc = 'Convert HEX, RGB, HSL color codes with preview';
    const syntax = '.color #3b82f6';
    const example = '.color #3b82f6';
    const nameUpper = 'COLOR';

    
    const input = args.join(' ').trim();
    
    const hex = (args[0] || '#3b82f6').replace('#', '');
    return reply(
      `╔═════『 *COLOR CONVERTER* 』═════\n` +
      `🎨 *HEX:* #${hex.toUpperCase()}\n` +
      `🌈 *RGB:* rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})\n` +
      `╚═════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
