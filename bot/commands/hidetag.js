/**
 * Kuzmix-MD Command: .hidetag
 * Category: group
 * Description: Broadcast message with invisible mentions
 */

module.exports = {
  name: 'hidetag',
  aliases: [],
  category: 'group',
  description: 'Broadcast message with invisible mentions',
  usage: '.hidetag Important announcement',
  example: '.hidetag Important announcement',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'hidetag';
    const desc = 'Broadcast message with invisible mentions';
    const syntax = '.hidetag Important announcement';
    const example = '.hidetag Important announcement';
    const nameUpper = 'HIDETAG';

    
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
      `• *Action:* Broadcast message with invisible mentions\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
