/**
 * Kuzmix-MD Command: .demote
 * Category: group
 * Description: Demote member from Admin privileges
 */

module.exports = {
  name: 'demote',
  aliases: [],
  category: 'group',
  description: 'Demote member from Admin privileges',
  usage: '.demote @user',
  example: '.demote @user',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'demote';
    const desc = 'Demote member from Admin privileges';
    const syntax = '.demote @user';
    const example = '.demote @user';
    const nameUpper = 'DEMOTE';

    
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
      `• *Action:* Demote member from Admin privileges\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
