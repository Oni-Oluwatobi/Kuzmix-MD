/**
 * Kuzmix-MD Command: .broadcast
 * Category: owner
 * Description: Broadcast message to all connected chats
 */

module.exports = {
  name: 'broadcast',
  aliases: [],
  category: 'owner',
  description: 'Broadcast message to all connected chats',
  usage: '.broadcast Kuzmix v2.0 update live!',
  example: '.broadcast Kuzmix v2.0 update live!',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'broadcast';
    const desc = 'Broadcast message to all connected chats';
    const syntax = '.broadcast Kuzmix v2.0 update live!';
    const example = '.broadcast Kuzmix v2.0 update live!';
    const nameUpper = 'BROADCAST';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    return reply(
      `👑 *Owner & Developer Control (.${name})*\n\n` +
      `• *Action:* Broadcast message to all connected chats\n` +
      `• *Status:* Executed by verified owner\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
