/**
 * Kuzmix-MD Command: .audio
 * Category: download
 * Description: Download audio from a YouTube link or search term
 */

module.exports = {
  name: 'audio',
  aliases: ['mp3'],
  category: 'download',
  description: 'Download audio from a YouTube link or search term',
  usage: '.audio https://youtu.be/VIDEO_ID',
  example: '.audio Asake Lonely At The Top',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { searchYoutubeAudio, downloadYoutubeAudio, formatMetadataCard } = require('../lib/youtube');

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Audio Downloader*\n\nUsage: \`.audio <youtube link OR search term>\`\nExample: \`.audio Asake Lonely At The Top\``);
    }

    await reply(`⬇️ *Preparing audio download...*\n\n_${config.watermark}_`);

    let meta;
    try {
      // Extract video ID from YouTube URL if provided
      const YT_URL_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/;
      const urlMatch = query.match(YT_URL_RE);

      if (urlMatch) {
        // Search by video ID to get metadata
        meta = await searchYoutubeAudio(urlMatch[1]);
      } else {
        meta = await searchYoutubeAudio(query);
      }
    } catch (err) {
      return reply(`❌ *Download failed:* ${err.message}`);
    }

    if (!meta) {
      return reply(`❌ *No audio found for:* ${query}`);
    }

    await reply(`🎧 *Found:* ${meta.title}\n\n_Downloading audio... please wait._`);

    try {
      const buffer = await downloadYoutubeAudio(meta);
      const { toWhatsAppVoice, looksLikeAudio, detectAudioMime } = require('../lib/voice');

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* Empty audio stream for "${meta.title}".`);
      }

      if (!looksLikeAudio(buffer)) {
        return reply(`❌ *Download failed:* the audio stream for "${meta.title}" was corrupted. Try another query.`);
      }

      // OGG/Opus with the real mimetype — audio/mp4 on mp3 data made
      // undecodable files on some clients.
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
      console.error('[AUDIO CMD ERROR]', err.message);
      return reply(`⚠️ *Could not download audio:* ${err.message}`);
    }
  }
};
