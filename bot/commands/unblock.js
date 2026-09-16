/**
 * Kuzmix-MD Command: .unblock
 * Category: owner
 * Description: Unblock user contact on WhatsApp
 */

module.exports = {
  name: 'unblock',
  aliases: [],
  category: 'owner',
  description: 'Unblock user contact on WhatsApp',
  usage: '.unblock @user',
  example: '.unblock @user',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'unblock';
    const desc = 'Unblock user contact on WhatsApp';
    const syntax = '.unblock @user';
    const example = '.unblock @user';
    const nameUpper = 'UNBLOCK';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Unblock user contact on WhatsApp\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
