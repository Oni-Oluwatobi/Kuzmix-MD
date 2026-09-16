/**
 * Kuzmix-MD Command: .admins
 * Category: group
 * Description: List all group administrators with links
 */

module.exports = {
  name: 'admins',
  aliases: [],
  category: 'group',
  description: 'List all group administrators with links',
  usage: '.admins',
  example: '.admins',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'admins';
    const desc = 'List all group administrators with links';
    const syntax = '.admins';
    const example = '.admins';
    const nameUpper = 'ADMINS';

    
    
    try {
      const metadata = await sock.groupMetadata(from);
      const admins = metadata.participants?.filter(p => p.admin === 'admin' || p.admin === 'superadmin') || [];
      let text = `╔═════『 *GROUP ADMINISTRATORS* 』═════\n` +
        `👥 *Total Admins:* ${admins.length}\n` +
        `╚════════════════════════════════════\n\n`;
      for (const a of admins) {
        text += `• @${a.id.split('@')[0]} ${a.admin === 'superadmin' ? '👑 (Creator)' : '🛡️'}\n`;
      }
      text += `\n_${config.watermark}_`;
      return await sock.sendMessage(from, { text, mentions: admins.map(a => a.id) }, { quoted: msg });
    } catch (err) {
      return reply(`❌ *Could not fetch admins:* ${err.message}`);
    }
    

  }
};
