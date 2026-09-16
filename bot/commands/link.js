/**
 * Kuzmix-MD Command: .link
 * Category: group
 * Description: Get active group invite link
 */

module.exports = {
  name: 'link',
  aliases: [],
  category: 'group',
  description: 'Get active group invite link',
  usage: '.link',
  example: '.link',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'link';
    const desc = 'Get active group invite link';
    const syntax = '.link';
    const example = '.link';
    const nameUpper = 'LINK';

    
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

    
    try {
      const code = await sock.groupInviteCode(from);
      return reply(
        `╔═════『 *GROUP INVITE LINK* 』═════\n` +
        `🔗 https://chat.whatsapp.com/${code}\n` +
        `╚═══════════════════════════════════\n\n` +
        `_${config.watermark}_`
      );
    } catch (err) {
      return reply(`❌ *Could not retrieve group link:* ${err.message}`);
    }
    

  }
};
