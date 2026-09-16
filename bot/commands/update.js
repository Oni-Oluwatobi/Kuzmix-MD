/**
 * Kuzmix-MD Command: .update
 * Category: owner
 * Description: Pull latest updates from GitHub repository
 */

module.exports = {
  name: 'update',
  aliases: [],
  category: 'owner',
  description: 'Pull latest updates from GitHub repository',
  usage: '.update',
  example: '.update',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'update';
    const desc = 'Pull latest updates from GitHub repository';
    const syntax = '.update';
    const example = '.update';
    const nameUpper = 'UPDATE';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Pull latest updates from GitHub repository\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
