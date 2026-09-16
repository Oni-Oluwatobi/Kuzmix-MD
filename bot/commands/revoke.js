/**
 * Kuzmix-MD Command: .revoke
 * Category: group
 * Description: Revoke and reset group invite link
 */

module.exports = {
  name: 'revoke',
  aliases: [],
  category: 'group',
  description: 'Revoke and reset group invite link',
  usage: '.revoke',
  example: '.revoke',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'revoke';
    const desc = 'Revoke and reset group invite link';
    const syntax = '.revoke';
    const example = '.revoke';
    const nameUpper = 'REVOKE';

    
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
      await sock.groupRevokeInvite(from);
      const newCode = await sock.groupInviteCode(from);
      return reply(
        `✅ *Group invite link has been revoked and reset!*\n\n` +
        `🔗 *New Link:* https://chat.whatsapp.com/${newCode}\n\n` +
        `_${config.watermark}_`
      );
    } catch (err) {
      return reply(`❌ *Could not revoke link:* ${err.message}`);
    }
    

  }
};
