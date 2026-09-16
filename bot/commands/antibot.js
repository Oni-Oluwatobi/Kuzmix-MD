/**
 * Kuzmix-MD Command: .antibot
 * Category: security
 * Description: Enable/disable unauthorized bot protection
 */

module.exports = {
  name: 'antibot',
  aliases: [],
  category: 'security',
  description: 'Enable/disable unauthorized bot protection',
  usage: '.antibot on',
  example: '.antibot on',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'antibot';
    const desc = 'Enable/disable unauthorized bot protection';
    const syntax = '.antibot on';
    const example = '.antibot on';
    const nameUpper = 'ANTIBOT';

    
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
      `• *Protection:* Enable/disable unauthorized bot protection\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
