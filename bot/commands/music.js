/**
 * Kuzmix-MD Command: .music
 * Category: download
 * Description: Search YouTube Premium and stream high-quality music audio
 */

module.exports = {
  name: 'music',
  aliases: ['piano'],
  category: 'download',
  description: 'Search YouTube and stream high-quality music audio',
  usage: '.music CKay Love Nwantiti',
  example: '.music CKay Love Nwantiti',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { searchYoutubeAudio, downloadYoutubeAudio, formatMetadataCard } = require('../lib/youtube');
    const name = 'music';
    const syntax = '.music CKay Love Nwantiti';
    const example = '.music CKay Love Nwantiti';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🎶 *Music Streaming (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply(`🎼 *Searching for:* ${query}\n\n_Loading the best available audio stream..._\n\n_${config.watermark}_`);

    let meta;
    try {
      meta = await searchYoutubeAudio(query);
    } catch (err) {
      return reply(`❌ *Search failed:* ${err.message}`);
    }

    if (!meta) {
      return reply(`❌ *No music found for:* ${query}`);
    }

    try {
      const buffer = await downloadYoutubeAudio(meta);
      const { toWhatsAppVoice, looksLikeAudio, detectAudioMime } = require('../lib/voice');

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* Empty audio stream for "${meta.title}".`);
      }

      if (!looksLikeAudio(buffer)) {
        return reply(`❌ *Download failed:* the audio stream for "${meta.title}" was corrupted. Try another query.`);
      }

      let payload;
      try {
        const voice = await toWhatsAppVoice(buffer, { music: true });
        payload = { audio: voice.buffer, mimetype: voice.mimetype, ptt: false };
      } catch (_) {
        payload = { audio: buffer, mimetype: detectAudioMime(buffer), ptt: false };
      }

      await sock.sendMessage(from, payload, { quoted: msg });

      return reply(formatMetadataCard(meta, config));
    } catch (err) {
      console.error('[MUSIC CMD ERROR]', err.message);
      return reply(`⚠️ *Could not stream that track:* ${err.message}\n\n▪️ Try a different query with \`${config.prefix}music <title>\``);
    }
  }
};