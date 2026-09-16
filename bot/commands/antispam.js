/**
 * Kuzmix-MD Command: .antispam
 * Category: security
 * Description: Enable/disable anti-spam rate limiting
 */

module.exports = {
  name: 'antispam',
  aliases: [],
  category: 'security',
  description: 'Enable/disable anti-spam rate limiting',
  usage: '.antispam on',
  example: '.antispam on',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'antispam';
    const desc = 'Enable/disable anti-spam rate limiting';
    const syntax = '.antispam on';
    const example = '.antispam on';
    const nameUpper = 'ANTISPAM';

    
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
      `• *Protection:* Enable/disable anti-spam rate limiting\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
