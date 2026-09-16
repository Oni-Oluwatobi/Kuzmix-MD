/**
 * Kuzmix-MD Command: .maintenance
 * Category: owner
 * Description: Toggle bot maintenance mode (owner only mode)
 */

module.exports = {
  name: 'maintenance',
  aliases: [],
  category: 'owner',
  description: 'Toggle bot maintenance mode (owner only mode)',
  usage: '.maintenance on',
  example: '.maintenance on',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'maintenance';
    const desc = 'Toggle bot maintenance mode (owner only mode)';
    const syntax = '.maintenance on';
    const example = '.maintenance on';
    const nameUpper = 'MAINTENANCE';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    const toggle = args[0]?.toLowerCase() === 'on';
    config.mode = toggle ? 'self' : 'public';
    return reply(`🛠️ *Maintenance Mode:* ${toggle ? 'ENABLED (Owner Only)' : 'DISABLED (Public)'}`);
    

  }
};
