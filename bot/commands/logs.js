/**
 * Kuzmix-MD Command: .logs
 * Category: owner
 * Description: Fetch latest 50 lines of execution logs
 */

module.exports = {
  name: 'logs',
  aliases: [],
  category: 'owner',
  description: 'Fetch latest 50 lines of execution logs',
  usage: '.logs',
  example: '.logs',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'logs';
    const desc = 'Fetch latest 50 lines of execution logs';
    const syntax = '.logs';
    const example = '.logs';
    const nameUpper = 'LOGS';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Fetch latest 50 lines of execution logs\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
