/**
 * Kuzmix-MD Command: .toaudio
 * Category: Media & Download
 * Description: Extracts audio from a video or voice note
 */

const { extractMediaInfo, downloadMedia } = require('../lib/mediaHelper');

module.exports = {
  name: 'toaudio',
  aliases: ['tomp3', 'extractaudio', 'vn'],
  category: 'Media & Download',
  description: 'Extract audio track from video or voice note',
  usage: '.toaudio (reply to video or audio)',
  example: '.toaudio',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, config } = ctx;

    const mediaInfo = extractMediaInfo(msg);

    if (!mediaInfo || (mediaInfo.type !== 'video' && mediaInfo.type !== 'audio')) {
      return reply(
        `🎵 *${config.botName} Audio Extractor*\n\n` +
        `• Reply to any video or voice note with \`${config.prefix}toaudio\` or \`${config.prefix}tomp3\`\n` +
        `• The bot will extract and send the audio track as an audio message.\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply('🎵 *Extracting audio track...*');

    try {
      const buffer = await downloadMedia(mediaInfo, sock, msg);

      if (!buffer || buffer.length === 0) {
        throw new Error('Downloaded media buffer was empty.');
      }

      await sock.sendMessage(
        from,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: false,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error('[TOAUDIO CMD ERROR]', err.message);
      await reply(`⚠️ *Could not extract audio:* ${err.message}`);
    }
  },
};
