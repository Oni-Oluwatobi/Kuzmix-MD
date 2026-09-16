/**
 * Kuzmix-MD Command: .antiflood
 * Category: security
 * Description: Enable/disable message flood protection
 */

module.exports = {
  name: 'antiflood',
  aliases: [],
  category: 'security',
  description: 'Enable/disable message flood protection',
  usage: '.antiflood on',
  example: '.antiflood on',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'antiflood';
    const desc = 'Enable/disable message flood protection';
    const syntax = '.antiflood on';
    const example = '.antiflood on';
    const nameUpper = 'ANTIFLOOD';

    
    if (!isGroup) {
      return reply('⚠️ *This command can only be used inside a WhatsApp group.*');
    }
    if (!isOwner) {
      try {
        const metadata = await sock.groupMetadata(from);
        const p = metadata.participants?.find(x => x.id === sender);
        if (p?.admin !== 'admin' && p?.admin !== 'superadmin') {
          return reply('⛔ *Access Denied:* Only Group Admins can execute .' + name + '.');
        }
      } catch (_) {}
    }

    const toggle = args[0]?.toLowerCase();
    const state = toggle === 'on' || toggle === 'enable' || toggle === '1';
    
    return reply(
      `🛡️ *Group Security Module (.${name})*\n\n` +
      `• *Status:* ${toggle ? (state ? 'ENABLED 🟢' : 'DISABLED 🔴') : 'ACTIVE 🛡️'}\n` +
      `• *Protection:* Enable/disable message flood protection\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
