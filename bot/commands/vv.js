/**
 * Kuzmix-MD View-Once Media Extractor (.vv / .viewonce / .rvo)
 * Recovers, decrypts, and permanently forwards view-once photos, videos, or voice notes.
 */

const { extractMediaInfo, downloadMedia } = require('../lib/mediaHelper');

module.exports = {
  name: 'vv',
  aliases: ['viewonce', 'antiviewonce', 'rvo', 'readviewonce'],
  category: 'Media & Download',
  description: 'Recovers and forwards view-once photos, videos, or voice notes permanently',
  usage: '.vv (reply to view-once message)',
  example: '.vv',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const mediaInfo = extractMediaInfo(msg);

    if (!mediaInfo || mediaInfo.type === 'sticker') {
      return reply(
        `👁️ *${config.botName} View-Once Extractor*\n\n` +
        `• Reply to any *View-Once* photo, video, or voice note with \`${config.prefix}vv\`\n` +
        `• The bot will unwrap the media and send it to you as a permanent file.\n\n` +
        `_${config.watermark}_`
      );
    }

    if (!mediaInfo.isViewOnce) {
      return reply(
        `⚠️ *That message is not a view-once.*\n\n` +
        `Reply only to a *View-Once (one-time 🔵)* photo, video, or voice note with \`${config.prefix}vv\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply('🔓 *Unwrapping View-Once media...*');

    try {
      const buffer = await downloadMedia(mediaInfo, sock, msg);

      if (!buffer || buffer.length === 0) {
        throw new Error('Retrieved media buffer was empty.');
      }

      const participantJid =
        msg.message?.extendedTextMessage?.contextInfo?.participant ||
        msg.key.participant ||
        msg.key.remoteJid;

      const senderTag = participantJid ? `@${participantJid.split('@')[0]}` : 'Sender';
      const origCaption = mediaInfo.caption ? `\n💬 *Original Caption:* ${mediaInfo.caption}\n` : '';

      const caption =
        `╔═════『 *VIEW-ONCE UNLOCKED* 』═════\n` +
        `🔓 *Status:* Decrypted Successfully\n` +
        `👤 *From:* ${senderTag}\n` +
        `📦 *Type:* ${mediaInfo.type.toUpperCase()}` +
        origCaption +
        `\n╚═════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      const mentions = participantJid ? [participantJid] : [];

      if (mediaInfo.type === 'image') {
        await sock.sendMessage(from, { image: buffer, caption, mentions }, { quoted: msg });
      } else if (mediaInfo.type === 'video') {
        await sock.sendMessage(from, { video: buffer, caption, mentions }, { quoted: msg });
      } else if (mediaInfo.type === 'audio') {
        await sock.sendMessage(from, { audio: buffer, mimetype: mediaInfo.mimetype || 'audio/mp4', ptt: true }, { quoted: msg });
      } else {
        await sock.sendMessage(
          from,
          {
            document: buffer,
            mimetype: mediaInfo.mimetype || 'application/octet-stream',
            fileName: mediaInfo.fileName || `view_once_${Date.now()}.${mediaInfo.type}`,
            caption,
            mentions,
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.error('[VV CMD ERROR]', err.message);
      await reply(
        `⚠️ *Could not extract view-once media:* ${err.message || 'Media expired or inaccessible'}\n\n` +
        `_Note: If WhatsApp already purged the media before linking or if the key was already consumed, it cannot be downloaded._`
      );
    }
  },
};
