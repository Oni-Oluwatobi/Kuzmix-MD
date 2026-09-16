/**
 * Kuzmix-MD Command: .group
 * Category: group
 * Description: Change group messaging mode (open/close)
 */

module.exports = {
  name: 'group',
  aliases: [],
  category: 'group',
  description: 'Change group messaging mode (open/close)',
  usage: '.group close',
  example: '.group close',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'group';
    const desc = 'Change group messaging mode (open/close)';
    const syntax = '.group close';
    const example = '.group close';
    const nameUpper = 'GROUP';

    
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

    
    const mode = args[0]?.toLowerCase();
    if (mode === 'close' || mode === 'closed') {
      try {
        await sock.groupSettingUpdate(from, 'announcement');
        return reply('🔒 *Group Closed:* Only Administrators can send messages now.');
      } catch (err) {
        return reply(`❌ *Failed to update group setting:* ${err.message}`);
      }
    } else if (mode === 'open' || mode === 'opened') {
      try {
        await sock.groupSettingUpdate(from, 'not_announcement');
        return reply('🔓 *Group Opened:* All members can send messages now.');
      } catch (err) {
        return reply(`❌ *Failed to update group setting:* ${err.message}`);
      }
    }
    return reply(`⚙️ *Group Setting Control*\n\nUsage: \`${config.prefix}group open\` or \`${config.prefix}group close\``);
    

  }
};
