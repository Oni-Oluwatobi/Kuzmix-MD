/**
 * Kuzmix-MD Command: .audio
 * Category: download
 * Description: Download audio from a YouTube link or search term
 */

const YT_URL_RE = /^(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|shorts\/|embed\/)?([\w-]{11})/;

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
    const name = 'audio';
    const syntax = '.audio <youtube link OR search term>';
    const example = '.audio https://youtu.be/dQw4w9WgXcQ';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Audio Downloader (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply(`⬇️ *Preparing audio download...*\n\n_${config.watermark}_`);

    let meta;
    try {
      const urlMatch = query.match(YT_URL_RE);
      if (urlMatch) {
        const ytdl = require('@distube/ytdl-core');
        const videoId = urlMatch[1];
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const info = await ytdl.getInfo(url);
        const format = info.formats.find((f) => f.hasAudio && !f.hasVideo) || null;
        if (!format) {
          throw new Error('No audio stream available for that video.');
        }
        const durationSec = +info.videoDetails.lengthSeconds || 0;
        meta = {
          id: videoId,
          url,
          title: info.videoDetails.title || 'Untitled',
          author: info.videoDetails.author?.name || 'Unknown',
          durationSec,
          duration: durationSec ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}` : '?',
          viewCount: Number(info.videoDetails.viewCount) || 0,
          format,
        };
      } else {
        meta = await searchYoutubeAudio(query);
      }
    } catch (err) {
      return reply(`❌ *Download failed:* ${err.message}`);
    }

    if (!meta) {
      return reply(`❌ *No audio found for:* ${query}`);
    }

    await reply(`🎧 *Found:* ${meta.title}\n\n_Streaming audio... please wait._`);

    try {
      const buffer = await downloadYoutubeAudio(meta);

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* Empty audio stream for "${meta.title}".`);
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

      return reply(formatMetadataCard(meta, config));
    } catch (err) {
      console.error('[AUDIO CMD ERROR]', err.message);
      return reply(`⚠️ *Could not download audio:* ${err.message}`);
    }
  }
};