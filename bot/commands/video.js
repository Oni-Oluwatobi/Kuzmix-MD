/**
 * Kuzmix-MD Command: .video
 * Category: download
 * Description: Search YouTube and download a video (mp4). Falls back to link if only separate audio/video streams exist.
 */

module.exports = {
  name: 'video',
  aliases: ['vd', 'mp4'],
  category: 'download',
  description: 'Search YouTube and download a video (mp4)',
  usage: '.video Burna Boy concert performance',
  example: '.video Next.js tutorial',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const name = 'video';
    const syntax = '.video Burna Boy City Boys';
    const example = '.video Next.js tutorial';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🎬 *Video Downloader (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply(`🔎 *Searching for:* ${query}\n\n_Please wait..._\n\n_${config.watermark}_`);

    let ytSearch;
    let ytdl;
    try {
      ytSearch = require('yt-search');
      ytdl = require('@distube/ytdl-core');
    } catch (_) {
      return reply(`❌ *Downloader not installed.* Run \`npm install --ignore-scripts yt-search @distube/ytdl-core\` in the bot folder.`);
    }

    let video;
    try {
      const searchRes = await ytSearch(query);
      video = (Array.isArray(searchRes.videos) ? searchRes.videos : []).find((v) => v && v.videoId) || null;
      if (!video) {
        return reply(`❌ *No videos found for:* ${query}`);
      }
    } catch (err) {
      return reply(`❌ *Search failed:* ${err.message}`);
    }

    const url = `https://www.youtube.com/watch?v=${video.videoId}`;

    let info;
    try {
      info = await ytdl.getInfo(url);
    } catch (err) {
      return reply(`❌ *Could not resolve that video:* ${err.message}`);
    }

    // Prefer a combined audio+video mp4 (usually available up to 360p/480p)
    const formats = (Array.isArray(info.formats) ? info.formats : []).filter(
      (f) => f.hasVideo && f.hasAudio && f.container === 'mp4' && f.qualityLabel && f.qualityLabel.includes('360')
    );
    const format = formats[0] || (Array.isArray(info.formats) ? info.formats : []).find(
      (f) => f.hasVideo && f.hasAudio && f.container === 'mp4'
    );

    if (!format) {
      return reply(
        `⚠️ *This video has no directly streamable mp4 with audio* (separate video/audio streams only).\n\n` +
        `🎬 *${video.title}*\n` +
        `👤 ${video.author?.name || 'Unknown'}  •  ⏱️ ${
          video.seconds ? `${Math.floor(+video.seconds / 60)}:${String(+video.seconds % 60).padStart(2, '0')}` : '?'
        }\n` +
        `🔗 Watch it here: ${url}\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎬 *Found:* ${video.title}\n\n_Downloading ${format.qualityLabel || 'video'}... please wait._`);

    try {
      const { _streamToBuffer } = require('../lib/youtube');
      const stream = ytdl(url, { format });
      const buffer = await _streamToBuffer(stream);

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* Empty video stream.`);
      }

      await sock.sendMessage(
        from,
        {
          video: buffer,
          mimetype: 'video/mp4',
          caption:
            `🎬 *${video.title}*\n` +
            `👤 ${video.author?.name || 'Unknown'}\n` +
            `🔗 ${url}\n\n` +
            `_${config.watermark}_`,
        },
        { quoted: msg }
      );

      return reply(`✅ *Video downloaded successfully:* ${video.title}`);
    } catch (err) {
      console.error('[VIDEO CMD ERROR]', err.message);
      return reply(
        `⚠️ *Could not download video:* ${err.message}\n\n` +
        `▪️ The video may be large or region-restricted.\n` +
        `▪️ Try \`${config.prefix}video <different query>\` or use \`${config.prefix}audio\` for the audio track.`
      );
    }
  }
};