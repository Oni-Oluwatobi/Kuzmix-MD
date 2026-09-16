/**
 * Kuzmix-MD YouTube Audio Engine
 * Uses yt-search for discovery and @distube/ytdl-core for audio streaming.
 * No ffmpeg required — WhatsApp transcodes audio server-side before delivery.
 */

let ytSearch = null;
try {
  ytSearch = require('yt-search');
} catch (_) {
  ytSearch = require('../node_modules/yt-search');
}

let ytdl = null;
try {
  ytdl = require('@distube/ytdl-core');
} catch (_) {
  ytdl = require('../node_modules/@distube/ytdl-core');
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function pickAudioFormat(info) {
  const formats = Array.isArray(info.formats) ? info.formats : [];
  const audioOnly = formats.filter((f) => f.hasAudio && !f.hasVideo);

  if (audioOnly.length === 0) {
    throw new Error('No audio-only stream was returned by YouTube for this video.');
  }

  // WhatsApp-preferable: m4a/AAC in mp4 container first
  const m4a = audioOnly.find((f) => f.container === 'm4a') || audioOnly.find((f) => f.mimetype && f.mimetype.includes('audio/mp4'));
  if (m4a) return { ...m4a, mimetype: 'audio/mp4' };

  // Otherwise opus in webm — WhatsApp transcodes server-side
  return { ...audioOnly[0], mimetype: 'audio/mp4' };
}

async function searchYoutubeAudio(query) {
  if (!ytSearch || !ytdl) {
    throw new Error('YouTube engine unavailable. Run `npm install --ignore-scripts yt-search @distube/ytdl-core` in the bot folder.');
  }

  const searchRes = await ytSearch(query);
  const videos = (searchRes && Array.isArray(searchRes.videos) ? searchRes.videos : []).filter(
    (v) => v && v.videoId
  );

  // Prefer videos with length >= 60s (skip livestreams/shorts) but accept any real match
  const video =
    videos.find((v) => v.videoId && +v.seconds >= 60) ||
    videos.find((v) => v.videoId) ||
    null;

  if (!video) {
    throw new Error(`No YouTube results found for query: "${query}"`);
  }

  const url = `https://www.youtube.com/watch?v=${video.videoId}`;
  const info = await ytdl.getInfo(url, { requestOptions: { headers: { 'Accept-Language': 'en-US,en;q=0.9' } } });

  const format = pickAudioFormat(info);
  const duration = info.videoDetails.lengthSeconds
    ? `${Math.floor(+info.videoDetails.lengthSeconds / 60)}:${String(+info.videoDetails.lengthSeconds % 60).padStart(2, '0')}`
    : '?';

  return {
    id: video.videoId,
    url,
    title: video.title || info.videoDetails.title || 'Untitled',
    author: video.author?.name || info.videoDetails.author?.name || 'Unknown',
    durationSec: +video.seconds || +info.videoDetails.lengthSeconds || 0,
    duration,
    viewCount: video.views != null ? Number(video.views) : Number(info.videoDetails.viewCount) || 0,
    format,
  };
}

async function downloadYoutubeAudio(meta) {
  const stream = ytdl(meta.url, { quality: 'lowestaudio' });
  return streamToBuffer(stream);
}

function formatMetadataCard(meta, config) {
  const isLive = meta.durationSec === 0;
  return (
    `╔═════『 *${config.botName} AUDIO DOWNLOAD* 』═════\n` +
    `🎵 *Title:* ${meta.title}\n` +
    `👤 *Channel:* ${meta.author}\n` +
    `⏱️ *Duration:* ${isLive ? 'LIVE' : meta.duration}\n` +
    `👁️ *Views:* ${Number(meta.viewCount).toLocaleString()}\n` +
    `🔗 *Link:* ${meta.url}\n` +
    `╚═══════════════════════════════════\n\n` +
    `_${config.watermark}_`
  );
}

module.exports = {
  searchYoutubeAudio,
  downloadYoutubeAudio,
  formatMetadataCard,
  _pickAudioFormat: pickAudioFormat,
  _streamToBuffer: streamToBuffer,
};