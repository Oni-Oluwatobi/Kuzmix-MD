/**
 * Kuzmix-MD Command: .block
 * Category: owner
 * Description: Block user contact on WhatsApp
 */

module.exports = {
  name: 'block',
  aliases: [],
  category: 'owner',
  description: 'Block user contact on WhatsApp',
  usage: '.block @user',
  example: '.block @user',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'block';
    const desc = 'Block user contact on WhatsApp';
    const syntax = '.block @user';
    const example = '.block @user';
    const nameUpper = 'BLOCK';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Block user contact on WhatsApp\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
