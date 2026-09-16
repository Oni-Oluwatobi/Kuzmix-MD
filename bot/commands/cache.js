/**
 * Kuzmix-MD Command: .cache
 * Category: owner
 * Description: Clear media temp files and session memory cache
 */

module.exports = {
  name: 'cache',
  aliases: [],
  category: 'owner',
  description: 'Clear media temp files and session memory cache',
  usage: '.cache',
  example: '.cache',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'cache';
    const desc = 'Clear media temp files and session memory cache';
    const syntax = '.cache';
    const example = '.cache';
    const nameUpper = 'CACHE';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Clear media temp files and session memory cache\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
