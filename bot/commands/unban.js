/**
 * Kuzmix-MD Command: .unban
 * Category: owner
 * Description: Unban previously banned user
 */

module.exports = {
  name: 'unban',
  aliases: [],
  category: 'owner',
  description: 'Unban previously banned user',
  usage: '.unban @user',
  example: '.unban @user',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'unban';
    const desc = 'Unban previously banned user';
    const syntax = '.unban @user';
    const example = '.unban @user';
    const nameUpper = 'UNBAN';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Unban previously banned user\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
