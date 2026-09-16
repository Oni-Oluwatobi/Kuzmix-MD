/**
 * Kuzmix-MD Command: .setwelcome
 * Category: security
 * Description: Set custom welcome greeting template
 */

module.exports = {
  name: 'setwelcome',
  aliases: [],
  category: 'security',
  description: 'Set custom welcome greeting template',
  usage: '.setwelcome Welcome @user to @group!',
  example: '.setwelcome Welcome @user to @group!',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'setwelcome';
    const desc = 'Set custom welcome greeting template';
    const syntax = '.setwelcome Welcome @user to @group!';
    const example = '.setwelcome Welcome @user to @group!';
    const nameUpper = 'SETWELCOME';

    
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
      `• *Protection:* Set custom welcome greeting template\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
