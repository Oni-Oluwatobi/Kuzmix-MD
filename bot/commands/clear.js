/**
 * Kuzmix-MD Command: .clear
 * Category: general
 * Description: Clear chat messages
 */

module.exports = {
  name: 'clear',
  aliases: ['cls', 'clean'],
  category: 'general',
  description: 'Clear chat history from this conversation',
  usage: '.clear',
  example: '.clear',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (isGroup) {
      const groupMeta = await sock.groupMetadata(from).catch(() => null);
      const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
      const participant = groupMeta?.participants?.find(p => p.id === botId);
      const senderMeta = groupMeta?.participants?.find(p => p.id === sender);
      const senderIsAdmin = senderMeta?.admin === 'admin' || senderMeta?.admin === 'superadmin';

      if (!senderIsAdmin && !ctx.isOwner) {
        return reply('🔒 *Admin Only*\n\nOnly group admins or bot owner can use this command.');
      }
    } else if (!ctx.isOwner) {
      return reply('🔒 *Owner Only*\n\nThis command can only be used by the bot owner in private chats.');
    }

    try {
      if (typeof sock.modifyChat === 'function') {
        await sock.modifyChat(from, 'clear');
        return reply('✅ *Chat cleared.*');
      }

      if (typeof sock.chatModify === 'function') {
        await sock.chatModify({ clear: true }, from);
        return reply('✅ *Chat cleared.*');
      }

      const chats = sock.store?.messages?.[from] || [];
      const botMsgs = chats.filter(m => m.key?.fromMe).slice(-20);

      if (botMsgs.length === 0) {
        return reply('ℹ️ *No bot messages found to clear.*');
      }

      let deleted = 0;
      for (const m of botMsgs) {
        try {
          await sock.sendMessage(from, { delete: m.key });
          deleted++;
          await new Promise(r => setTimeout(r, 300));
        } catch (_) {}
      }

      return reply(`✅ *Cleared ${deleted} bot message(s).*`);
    } catch (err) {
      console.error('[CLEAR CMD ERROR]', err.message);
      return reply(`⚠️ *Clear failed:* ${err.message}`);
    }
  }
};
