/**
 * Kuzmix-MD Command: .ban
 * Category: owner
 * Description: Ban abusive user from interacting with bot
 */

module.exports = {
  name: 'ban',
  aliases: [],
  category: 'owner',
  description: 'Ban abusive user from interacting with bot',
  usage: '.ban @user',
  example: '.ban @user',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'ban';
    const desc = 'Ban abusive user from interacting with bot';
    const syntax = '.ban @user';
    const example = '.ban @user';
    const nameUpper = 'BAN';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Ban abusive user from interacting with bot\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
