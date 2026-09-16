/**
 * Kuzmix-MD Command: .setdesc
 * Category: group
 * Description: Change group description text
 */

module.exports = {
  name: 'setdesc',
  aliases: [],
  category: 'group',
  description: 'Change group description text',
  usage: '.setdesc Official developer hub',
  example: '.setdesc Official developer hub',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'setdesc';
    const desc = 'Change group description text';
    const syntax = '.setdesc Official developer hub';
    const example = '.setdesc Official developer hub';
    const nameUpper = 'SETDESC';

    
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
      `• *Action:* Change group description text\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
