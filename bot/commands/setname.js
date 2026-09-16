/**
 * Kuzmix-MD Command: .setname
 * Category: group
 * Description: Change group subject/name
 */

module.exports = {
  name: 'setname',
  aliases: [],
  category: 'group',
  description: 'Change group subject/name',
  usage: '.setname Kuzmix Dev Squad',
  example: '.setname Kuzmix Dev Squad',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'setname';
    const desc = 'Change group subject/name';
    const syntax = '.setname Kuzmix Dev Squad';
    const example = '.setname Kuzmix Dev Squad';
    const nameUpper = 'SETNAME';

    
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
      `• *Action:* Change group subject/name\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
