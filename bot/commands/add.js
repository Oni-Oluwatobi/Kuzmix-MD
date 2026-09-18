/**
 * Kuzmix-MD Command: .add
 * Category: Group Admin
 * Description: Add a phone number to the group
 */

module.exports = {
  name: 'add',
  aliases: [],
  category: 'Group Admin',
  description: 'Add a phone number to the group',
  usage: '.add 2348123456789',
  example: '.add 2348123456789',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, isGroup, isOwner, sender, args, reply } = ctx;

    if (!isGroup) {
      return reply('⚠️ *This command can only be used inside a WhatsApp group.*');
    }

    const number = args[0]?.replace(/\D/g, '');
    if (!number || number.length < 7) {
      return reply(
        `📱 *Add Member*\n\n` +
        `*Usage:* \`.add <phone number>\`\n` +
        `*Example:* \`.add 2348123456789\`\n\n` +
        `Include country code (e.g. 234 for Nigeria).`
      );
    }

    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];

      // Check if caller is admin
      const senderParticipant = participants.find(p => p.id === sender);
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin' || isOwner;

      if (!isAdmin) {
        return reply('⛔ *Access Denied:* Only Group Admins can add members.');
      }

      // Check if already in group
      const jid = `${number}@s.whatsapp.net`;
      const alreadyMember = participants.find(p => p.id === jid);
      if (alreadyMember) {
        return reply(`✅ *${number}* is already in this group.`);
      }

      // Add the participant
      const result = await sock.groupParticipantsUpdate(from, [jid], 'add');

      if (result && result[0] && result[0].status === '403') {
        return reply(
          `❌ *Could not add ${number}*\n\n` +
          `They may have privacy settings that block group invites.\n` +
          `Ask them to open: *Settings > Privacy > Groups > Everyone*`
        );
      }

      return reply(`✅ *${number}* has been added to the group!`);
    } catch (err) {
      console.error('[ADD CMD ERROR]', err.message);
      return reply(`❌ *Could not add member:* ${err.message}`);
    }
  },
};
