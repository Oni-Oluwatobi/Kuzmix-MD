/**
 * Kuzmix-MD Command: .timezone
 * Category: internet
 * Description: Timezone offset & coordinate info
 */

module.exports = {
  name: 'timezone',
  aliases: [],
  category: 'internet',
  description: 'Timezone offset & coordinate info',
  usage: '.timezone GMT+1',
  example: '.timezone GMT+1',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'timezone';
    const desc = 'Timezone offset & coordinate info';
    const syntax = '.timezone GMT+1';
    const example = '.timezone GMT+1';
    const nameUpper = 'TIMEZONE';

    
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
