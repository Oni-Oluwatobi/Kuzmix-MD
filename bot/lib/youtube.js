/**
 * Kuzmix-MD YouTube Audio Engine
 * Uses yt-search for discovery and youtubei.js (InnerTube) for streaming.
 * InnerTube doesn't trigger YouTube's anti-bot — works from cloud servers.
 */

let ytSearch = null;
try {
  ytSearch = require('yt-search');
} catch (_) {
  ytSearch = require('../node_modules/yt-search');
}

let Innertube = null;
try {
  Innertube = require('youtubei.js').Innertube;
} catch (_) {
  try {
    Innertube = require('../node_modules/youtubei.js').Innertube;
  } catch (_) {}
}

let ytInstance = null;

async function getYT() {
  if (!Innertube) {
    throw new Error('youtubei.js not installed. Run: npm install youtubei.js');
  }
  if (!ytInstance) {
    ytInstance = await Innertube.create({ retrieve_player: false });
  }
  return ytInstance;
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function searchYoutubeAudio(query) {
  if (!ytSearch) {
    throw new Error('yt-search not installed. Run: npm install yt-search');
  }

  const searchRes = await ytSearch(query);
  const videos = (searchRes && Array.isArray(searchRes.videos) ? searchRes.videos : []).filter(
    (v) => v && v.videoId
  );

  const video =
    videos.find((v) => v.videoId && +v.seconds >= 60) ||
    videos.find((v) => v.videoId) ||
    null;

  if (!video) {
    throw new Error(`No YouTube results found for: "${query}"`);
  }

  const url = `https://www.youtube.com/watch?v=${video.videoId}`;
  const duration = video.seconds
    ? `${Math.floor(+video.seconds / 60)}:${String(+video.seconds % 60).padStart(2, '0')}`
    : '?';

  return {
    id: video.videoId,
    url,
    title: video.title || 'Untitled',
    author: video.author?.name || 'Unknown',
    durationSec: +video.seconds || 0,
    duration,
    viewCount: video.views != null ? Number(video.views) : 0,
  };
}

async function downloadYoutubeAudio(meta) {
  const yt = await getYT();
  const info = await yt.getInfo(meta.id);

  // Get audio-only stream
  const format = info.chooseFormat({ type: 'audio', quality: 'lowest' });
  const stream = await info.download({ type: 'audio' });
  return streamToBuffer(stream);
}

async function downloadYoutubeVideo(meta, qualityLabel) {
  const yt = await getYT();
  const info = await yt.getInfo(meta.id);

  // Try to get a combined audio+video stream
  const format = info.chooseFormat({ type: 'video+audio', quality: '360p' }).catch(() => null);
  const stream = await info.download({ type: 'video+audio', quality: '360p' }).catch(async () => {
    return info.download({ type: 'video+audio' });
  });
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
  downloadYoutubeVideo,
  formatMetadataCard,
  _streamToBuffer: streamToBuffer,
};
