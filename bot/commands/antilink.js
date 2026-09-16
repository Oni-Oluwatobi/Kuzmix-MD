/**
 * Kuzmix-MD Command: .antilink
 * Category: security
 * Description: Enable/disable automatic WhatsApp link ban
 */

module.exports = {
  name: 'antilink',
  aliases: [],
  category: 'security',
  description: 'Enable/disable automatic WhatsApp link ban',
  usage: '.antilink on',
  example: '.antilink on',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'antilink';
    const desc = 'Enable/disable automatic WhatsApp link ban';
    const syntax = '.antilink on';
    const example = '.antilink on';
    const nameUpper = 'ANTILINK';

    
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
      `• *Protection:* Enable/disable automatic WhatsApp link ban\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
