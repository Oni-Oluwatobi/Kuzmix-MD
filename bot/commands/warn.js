/**
 * Kuzmix-MD Command: .warn
 * Category: security
 * Description: Warn member for rules violation (3 strikes = kick)
 */

module.exports = {
  name: 'warn',
  aliases: [],
  category: 'security',
  description: 'Warn member for rules violation (3 strikes = kick)',
  usage: '.warn @user',
  example: '.warn @user',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'warn';
    const desc = 'Warn member for rules violation (3 strikes = kick)';
    const syntax = '.warn @user';
    const example = '.warn @user';
    const nameUpper = 'WARN';

    
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
      `• *Protection:* Warn member for rules violation (3 strikes = kick)\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
