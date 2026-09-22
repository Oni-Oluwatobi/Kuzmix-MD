/**
 * Kuzmix-MD Command: .clear
 * Category: general
 * Description: Clear bot messages from chat
 */

module.exports = {
  name: 'clear',
  aliases: ['cls', 'clean'],
  category: 'general',
  description: 'Delete bot messages from this chat',
  usage: '.clear',
  example: '.clear',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (isGroup) {
      const groupMeta = await sock.groupMetadata(from).catch(() => null);
      const senderMeta = groupMeta?.participants?.find(p => p.id === sender);
      const senderIsAdmin = senderMeta?.admin === 'admin' || senderMeta?.admin === 'superadmin';

      if (!senderIsAdmin && !ctx.isOwner) {
        return reply('🔒 *Admin Only*\n\nOnly group admins or bot owner can use this command.');
      }
    } else if (!ctx.isOwner) {
      return reply('🔒 *Owner Only*\n\nThis command can only be used by the bot owner in private chats.');
    }

    const messageStore = require('../lib/messageStore');
    const keys = messageStore.clear(from);

    if (keys.length === 0) {
      return reply('ℹ️ *No bot messages to clear.*\n\nBot only tracks messages sent after this update.');
    }

    let deleted = 0;
    for (const key of keys) {
      try {
        await sock.sendMessage(from, { delete: key });
        deleted++;
        await new Promise(r => setTimeout(r, 300));
      } catch (_) {}
    }

    return reply(`✅ *Cleared ${deleted} bot message(s).*`);
  }
};
