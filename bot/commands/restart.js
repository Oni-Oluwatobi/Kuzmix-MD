/**
 * Kuzmix-MD Command: .restart
 * Category: owner
 * Description: Safely restart the Kuzmix-MD Node.js instance
 */

module.exports = {
  name: 'restart',
  aliases: [],
  category: 'owner',
  description: 'Safely restart the Kuzmix-MD Node.js instance',
  usage: '.restart',
  example: '.restart',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'restart';
    const desc = 'Safely restart the Kuzmix-MD Node.js instance';
    const syntax = '.restart';
    const example = '.restart';
    const nameUpper = 'RESTART';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    await reply('🔄 *Restarting Kuzmix-MD Node.js instance...*');
    setTimeout(() => process.exit(0), 1000);
    

  }
};
