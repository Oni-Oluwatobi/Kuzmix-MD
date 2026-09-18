/**
 * Kuzmix-MD YouTube Audio Engine
 * Uses yt-search for discovery and Cobalt API for downloads.
 * Cobalt (cobalt.tools) is free, no sign-in required, works from cloud servers.
 */

let ytSearch = null;
try {
  ytSearch = require('yt-search');
} catch (_) {
  ytSearch = require('../node_modules/yt-search');
}

const https = require('https');
const http = require('http');

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const postData = JSON.stringify(body);
    const req = mod.request({
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
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

async function downloadFromCobalt(url, downloadMode) {
  // Try multiple Cobalt instances
  const instances = [
    'https://api.cobalt.tools',
    'https://cobalt-api.hyper.lol',
  ];

  for (const instance of instances) {
    try {
      const res = await httpPost(`${instance}/`, {
        url,
        downloadMode: downloadMode || 'audio',
        audioFormat: 'mp3',
        filenameStyle: 'basic',
      });

      const body = JSON.parse(res.data);

      if (body.url) {
        // Download the file from the returned URL
        const fileRes = await httpGet(body.url);
        return Buffer.from(fileRes.data, 'binary');
      }

      if (body.error) {
        throw new Error(body.error.message || body.error);
      }
    } catch (err) {
      console.warn(`[COBALT] Instance ${instance} failed:`, err.message);
      continue;
    }
  }

  throw new Error('All Cobalt instances failed. Try again later.');
}

async function downloadYoutubeAudio(meta) {
  return downloadFromCobalt(meta.url, 'audio');
}

async function downloadYoutubeVideo(meta) {
  return downloadFromCobalt(meta.url, 'auto');
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
