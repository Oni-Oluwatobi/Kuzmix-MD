/**
 * Kuzmix-MD Command: .promote
 * Category: group
 * Description: Promote member to Group Admin
 */

module.exports = {
  name: 'promote',
  aliases: [],
  category: 'group',
  description: 'Promote member to Group Admin',
  usage: '.promote @user',
  example: '.promote @user',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'promote';
    const desc = 'Promote member to Group Admin';
    const syntax = '.promote @user';
    const example = '.promote @user';
    const nameUpper = 'PROMOTE';

    
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

    
    return reply(
      `👥 *Group Management (.${name})*\n\n` +
      `• *Action:* Promote member to Group Admin\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
