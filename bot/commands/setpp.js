/**
 * Kuzmix-MD Command: .setpp
 * Category: group
 * Description: Update group profile icon picture
 */

module.exports = {
  name: 'setpp',
  aliases: [],
  category: 'group',
  description: 'Update group profile icon picture',
  usage: '.setpp',
  example: '.setpp',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'setpp';
    const desc = 'Update group profile icon picture';
    const syntax = '.setpp';
    const example = '.setpp';
    const nameUpper = 'SETPP';

    
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
      `• *Action:* Update group profile icon picture\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
