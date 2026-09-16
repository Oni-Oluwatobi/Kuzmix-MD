/**
 * Kuzmix-MD Command: .time
 * Category: internet
 * Description: Current local time in any city/country
 */

module.exports = {
  name: 'time',
  aliases: [],
  category: 'internet',
  description: 'Current local time in any city/country',
  usage: '.time London',
  example: '.time London',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'time';
    const desc = 'Current local time in any city/country';
    const syntax = '.time London';
    const example = '.time London';
    const nameUpper = 'TIME';

    
    const query = args.join(' ').trim();
    
    const target = query || 'UTC';
    const now = new Date();
    return reply(
      `╔═════『 *WORLD TIME CLOCK* 』═════\n` +
      `🌍 *Location:* ${target}\n` +
      `🕒 *Current Time:* ${now.toTimeString()}\n` +
      `📅 *Date:* ${now.toDateString()}\n` +
      `╚══════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
