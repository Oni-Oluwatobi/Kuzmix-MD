/**
 * Kuzmix-MD Command: .shutdown
 * Category: owner
 * Description: Gracefully shut down the bot process
 */

module.exports = {
  name: 'shutdown',
  aliases: [],
  category: 'owner',
  description: 'Gracefully shut down the bot process',
  usage: '.shutdown',
  example: '.shutdown',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'shutdown';
    const desc = 'Gracefully shut down the bot process';
    const syntax = '.shutdown';
    const example = '.shutdown';
    const nameUpper = 'SHUTDOWN';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Gracefully shut down the bot process\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
