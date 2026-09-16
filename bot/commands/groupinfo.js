/**
 * Kuzmix-MD Group Info Command (.groupinfo / .gc / .ginfo)
 * Displays group details, participants, admins, and permissions
 */

module.exports = {
  name: 'groupinfo',
  aliases: ['gc', 'group', 'ginfo'],
  category: 'Group Admin',
  description: 'Displays detailed information about the current WhatsApp group',
  usage: '.groupinfo',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, isGroup, reply, config } = ctx;

    if (!isGroup) {
      return reply('⚠️ *This command can only be used inside a WhatsApp group.*');
    }

    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
      const creationDate = new Date(metadata.creation * 1000).toLocaleDateString();

      const infoText =
        `╔═════『 *GROUP INFORMATION* 』═════\n` +
        `║ 🏷️ *Name:* ${metadata.subject}\n` +
        `║ 🆔 *Group JID:* \`${metadata.id}\`\n` +
        `║ 👥 *Members:* ${participants.length}\n` +
        `║ 🛡️ *Admins:* ${admins.length}\n` +
        `║ 👑 *Created By:* +${metadata.owner ? metadata.owner.split('@')[0] : 'Unknown'}\n` +
        `║ 📅 *Created On:* ${creationDate}\n` +
        `║ 🔒 *Edit Info Locked:* ${metadata.restrict ? 'Yes' : 'No'}\n` +
        `║ 💬 *Send Messages Locked:* ${metadata.announce ? 'Yes' : 'No'}\n` +
        `╚═══════════════════════════════════\n\n` +
        (metadata.desc ? `📝 *Description:*\n${metadata.desc}\n\n` : '') +
        `_${config.watermark}_`;

      await reply(infoText);
    } catch (err) {
      console.error('[GROUPINFO CMD ERROR]', err.message);
      await reply(`❌ *Could not fetch group info:* ${err.message}`);
    }
  },
};
