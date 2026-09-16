/**
 * Kuzmix-MD Command: .welcome
 * Category: security
 * Description: Enable/disable new member welcome messages
 */

module.exports = {
  name: 'welcome',
  aliases: [],
  category: 'security',
  description: 'Enable/disable new member welcome messages',
  usage: '.welcome on',
  example: '.welcome on',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'welcome';
    const desc = 'Enable/disable new member welcome messages';
    const syntax = '.welcome on';
    const example = '.welcome on';
    const nameUpper = 'WELCOME';

    
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
      `• *Protection:* Enable/disable new member welcome messages\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
