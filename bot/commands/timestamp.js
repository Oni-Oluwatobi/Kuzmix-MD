/**
 * Kuzmix-MD Command: .timestamp
 * Category: utilities
 * Description: Convert timestamp to readable date/time
 */

module.exports = {
  name: 'timestamp',
  aliases: [],
  category: 'utilities',
  description: 'Convert timestamp to readable date/time',
  usage: '.timestamp 1718000000',
  example: '.timestamp 1718000000',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'timestamp';
    const desc = 'Convert timestamp to readable date/time';
    const syntax = '.timestamp 1718000000';
    const example = '.timestamp 1718000000';
    const nameUpper = 'TIMESTAMP';

    
    const input = args.join(' ').trim();
    
    const t = input ? parseInt(input) : Math.floor(Date.now() / 1000);
    const date = new Date(t * 1000);
    return reply(
      `╔═════『 *TIMESTAMP CONVERTER* 』═════\n` +
      `⏱️ *Unix Timestamp:* ${t}\n` +
      `📅 *UTC Date:* ${date.toUTCString()}\n` +
      `🕒 *ISO String:* ${date.toISOString()}\n` +
      `╚═════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
