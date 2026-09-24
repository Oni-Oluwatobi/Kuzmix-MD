/**
 * Kuzmix-MD Command: .tagall
 * Category: Group Admin
 * Description: Tag all members in one message (silent, no spam)
 */

module.exports = {
  name: 'tagall',
  aliases: ['everyone', 'pingall'],
  category: 'Group Admin',
  description: 'Tag all members in one message',
  usage: '.tagall [message]',
  example: '.tagall Meeting in 10 mins',
  permission: 'admin',

  async execute(ctx) {
    const { sock, msg, from, isGroup, isOwner, sender, args, reply, config } = ctx;

    if (!isGroup) {
      return reply('⚠️ *This command can only be used inside a WhatsApp group.*');
    }
    // Mass-mention commands are owner-only while private mode is active
    if (!isOwner && config.privateMode) {
      return reply('🔒 *Private Mode Active:* Mass-mention commands are owner-only while private mode is on.');
    }

    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants || [];

      const senderParticipant = participants.find(p => p.id === sender);
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin' || isOwner;

      if (!isAdmin) {
        return reply('⛔ *Access Denied:* Only Group Admins can use `.tagall`.');
      }

      const announcement = args.join(' ').trim() || 'Attention everyone!';
      const mentions = participants.map(p => p.id);

      // Build mention string: @number1 @number2 ...
      const mentionTags = participants.map(p => `@${p.id.split('@')[0]}`).join(' ');

      // Single message: announcement + all mentions
      const text = `📢 *${announcement}*\n\n${mentionTags}`;

      await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    } catch (err) {
      console.error('[TAGALL CMD ERROR]', err.message);
      await reply('❌ Could not tag group members.');
    }
  },
};
