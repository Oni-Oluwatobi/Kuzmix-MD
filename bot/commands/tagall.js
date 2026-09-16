/**
 * Kuzmix-MD Tag All Command (.tagall / .everyone / .hidetag)
 * Mentions all members in the group with a custom announcement
 */

module.exports = {
  name: 'tagall',
  aliases: ['everyone', 'hidetag', 'pingall'],
  category: 'Group Admin',
  description: 'Mentions every member in the group with an announcement message',
  usage: '.tagall [announcement text]',
  example: '.tagall Meeting starts in 10 minutes!',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, isGroup, isOwner, sender, args, reply, config } = ctx;

    if (!isGroup) {
      return reply('⚠️ *This command can only be used inside a WhatsApp group.*');
    }

    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];

      // Check if caller is admin or bot owner
      const senderParticipant = participants.find(p => p.id === sender);
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin' || isOwner;

      if (!isAdmin) {
        return reply('⛔ *Access Denied:* Only Group Admins can use `.tagall`.');
      }

      const announcement = args.join(' ').trim() || 'Attention everyone!';
      const mentions = participants.map(p => p.id);

      let text =
        `╔═════『 *GROUP ANNOUNCEMENT* 』═════\n` +
        `📢 *Message:* ${announcement}\n` +
        `👥 *Total Members:* ${participants.length}\n` +
        `╚════════════════════════════════════\n\n`;

      for (const p of participants) {
        text += `• @${p.id.split('@')[0]}\n`;
      }

      text += `\n_${config.watermark}_`;

      await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    } catch (err) {
      console.error('[TAGALL CMD ERROR]', err.message);
      await reply(`❌ *Could not tag group members:* ${err.message}`);
    }
  },
};
