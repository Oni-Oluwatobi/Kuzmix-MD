/**
 * Kuzmix-MD Command: .resetwarn
 * Category: security
 * Description: Reset warning counter for member
 */

module.exports = {
  name: 'resetwarn',
  aliases: [],
  category: 'security',
  description: 'Reset warning counter for member',
  usage: '.resetwarn @user',
  example: '.resetwarn @user',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'resetwarn';
    const desc = 'Reset warning counter for member';
    const syntax = '.resetwarn @user';
    const example = '.resetwarn @user';
    const nameUpper = 'RESETWARN';

    
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
      `• *Protection:* Reset warning counter for member\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
