/**
 * Kuzmix-MD Command: .setgoodbye
 * Category: security
 * Description: Set custom goodbye message template
 */

module.exports = {
  name: 'setgoodbye',
  aliases: [],
  category: 'security',
  description: 'Set custom goodbye message template',
  usage: '.setgoodbye Goodbye @user, we will miss you!',
  example: '.setgoodbye Goodbye @user, we will miss you!',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'setgoodbye';
    const desc = 'Set custom goodbye message template';
    const syntax = '.setgoodbye Goodbye @user, we will miss you!';
    const example = '.setgoodbye Goodbye @user, we will miss you!';
    const nameUpper = 'SETGOODBYE';

    
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
      `• *Protection:* Set custom goodbye message template\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
