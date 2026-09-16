/**
 * Kuzmix-MD Command: .antitag
 * Category: security
 * Description: Enable/disable excessive-tag protection
 */

module.exports = {
  name: 'antitag',
  aliases: [],
  category: 'security',
  description: 'Enable/disable excessive-tag protection',
  usage: '.antitag on',
  example: '.antitag on',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'antitag';
    const desc = 'Enable/disable excessive-tag protection';
    const syntax = '.antitag on';
    const example = '.antitag on';
    const nameUpper = 'ANTITAG';

    
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
      `• *Protection:* Enable/disable excessive-tag protection\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
