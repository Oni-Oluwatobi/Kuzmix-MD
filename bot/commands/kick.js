/**
 * Kuzmix-MD Command: .kick
 * Category: group
 * Description: Remove targeted member from group
 */

module.exports = {
  name: 'kick',
  aliases: [],
  category: 'group',
  description: 'Remove targeted member from group',
  usage: '.kick @user',
  example: '.kick @user',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'kick';
    const desc = 'Remove targeted member from group';
    const syntax = '.kick @user';
    const example = '.kick @user';
    const nameUpper = 'KICK';

    
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
      `• *Action:* Remove targeted member from group\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
