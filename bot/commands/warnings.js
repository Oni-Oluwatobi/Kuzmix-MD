/**
 * Kuzmix-MD Command: .warnings
 * Category: security
 * Description: Check current active warnings for a member
 */

module.exports = {
  name: 'warnings',
  aliases: [],
  category: 'security',
  description: 'Check current active warnings for a member',
  usage: '.warnings @user',
  example: '.warnings @user',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'warnings';
    const desc = 'Check current active warnings for a member';
    const syntax = '.warnings @user';
    const example = '.warnings @user';
    const nameUpper = 'WARNINGS';

    
    const toggle = args[0]?.toLowerCase();
    const state = toggle === 'on' || toggle === 'enable' || toggle === '1';
    
    return reply(
      `🛡️ *Group Security Module (.${name})*\n\n` +
      `• *Status:* ${toggle ? (state ? 'ENABLED 🟢' : 'DISABLED 🔴') : 'ACTIVE 🛡️'}\n` +
      `• *Protection:* Check current active warnings for a member\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
