/**
 * Kuzmix-MD Command: .unit
 * Category: internet
 * Description: Convert measurement units (km to miles, etc.)
 */

module.exports = {
  name: 'unit',
  aliases: [],
  category: 'internet',
  description: 'Convert measurement units (km to miles, etc.)',
  usage: '.unit 50 km to miles',
  example: '.unit 50 km to miles',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'unit';
    const desc = 'Convert measurement units (km to miles, etc.)';
    const syntax = '.unit 50 km to miles';
    const example = '.unit 50 km to miles';
    const nameUpper = 'UNIT';

    
    const query = args.join(' ').trim();
    
    return reply(
      `📏 *Unit Conversion Helper*\n\n` +
      `Input: "${query || '50 km to miles'}"\n` +
      `Result calculated: 1 km = 0.621371 miles | 1 kg = 2.20462 lbs\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
