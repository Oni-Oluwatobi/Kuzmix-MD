/**
 * Kuzmix-MD YouTube Audio Engine
 * Uses yt-search for discovery, then a multi-backend download chain:
 *   1. Cobalt API instances (proxied downloads, optional API key)
 *   2. @distube/ytdl-core (direct googlevideo extraction)
 * All downloads are binary-safe (Buffer chunks, never string-decoded).
 */

let ytSearch = null;
try {
  ytSearch = require('yt-search');
} catch (_) {
  try {
    ytSearch = require('../node_modules/yt-search');
  } catch (_) {
    ytSearch = null;
  }
}

const https = require('https');
const http = require('http');

const COBALT_INSTANCES = [
  'https://co.otomir23.me',
  'https://api.cobalt.tools',
  'https://cobalt-backend.canine.tools',
  'https://capi.3kh0.net',
];

// cobalt v10 renamed audioFormat/videoQuality → aFormat/vQuality, but strict
// instances reject unknown keys. Try classic keys first (works on strict v10),
// then the new-key shape for instances that only accept it.
function cobaltBodyVariants(url, downloadMode) {
  const mode = downloadMode === 'auto' ? 'auto' : 'audio';
  return [
    {
      url,
      downloadMode: mode,
      audioFormat: 'mp3',
      videoQuality: '720',
      filenameStyle: 'basic',
    },
    {
      url,
      downloadMode: mode,
      aFormat: 'mp3',
      vQuality: '720',
      filenameStyle: 'basic',
    },
  ];
}

function requestBuffer(url, { headers = {}, method = 'GET', body = null, timeoutMs = 30000, maxBytes = 90 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const req = mod.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        path: parsed.pathname + parsed.search,
        method,
        headers,
      },
      (res) => {
        const status = res.statusCode || 0;

        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          const next = new URL(res.headers.location, url).toString();
          requestBuffer(next, { headers, method: 'GET', body: null, timeoutMs, maxBytes })
            .then(resolve)
            .catch(reject);
          return;
        }

        if (status < 200 || status >= 300) {
          let errBody = '';
          res.on('data', (c) => {
            if (errBody.length < 500) errBody += c.toString('latin1');
          });
          res.on('end', () => reject(new Error(`HTTP ${status}${errBody ? `: ${errBody.slice(0, 200)}` : ''}`)));
          return;
        }

        const chunks = [];
        let total = 0;
        res.on('data', (chunk) => {
          total += chunk.length;
          if (total > maxBytes) {
            res.destroy();
            reject(new Error('download exceeded size limit'));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`request timed out after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function requestJson(url, { headers = {}, method = 'POST', body = null, timeoutMs = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const postData = body != null ? JSON.stringify(body) : null;
    const req = mod.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        path: parsed.pathname + parsed.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          if (data.length < 200000) data += chunk.toString('utf8');
        });
        res.on('end', () => resolve({ status: res.statusCode || 0, data }));
        res.on('error', reject);
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`request timed out after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
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

function cobaltError(body, status) {
  const err = body && body.error;
  if (typeof err === 'string') return err;
  if (err && err.code) return err.code;
  if (err && err.message) return err.message;
  if (body && body.status) return `status: ${body.status}`;
  return `HTTP ${status}`;
}

async function downloadFromCobalt(url, downloadMode) {
  const { looksLikeAudio } = require('./voice');
  const errors = [];
  const apiKey = process.env.COBALT_API_KEY;

  for (const instance of COBALT_INSTANCES) {
    for (const body of cobaltBodyVariants(url, downloadMode)) {
      try {
        const headers = {};
        if (apiKey) headers['Authorization'] = `Apikey ${apiKey}`;

        const res = await requestJson(`${instance}/`, {
          headers,
          method: 'POST',
          body,
          timeoutMs: 25000,
        });

        let parsed;
        try {
          parsed = JSON.parse(res.data);
        } catch (_) {
          throw new Error(`returned invalid JSON (HTTP ${res.status})`);
        }

        let fileUrl = null;
        if (parsed.status === 'picker') {
          fileUrl = parsed.picker && parsed.picker[0] && parsed.picker[0].url;
        } else if (parsed.url) {
          fileUrl = parsed.url;
        }

        if (!fileUrl) {
          throw new Error(cobaltError(parsed, res.status));
        }

        const buffer = await requestBuffer(fileUrl, { timeoutMs: 90000 });
        if (!buffer.length || buffer.length < 512) {
          throw new Error('downloaded file is empty');
        }
        if (!looksLikeAudio(buffer)) {
          throw new Error('downloaded file is not valid audio');
        }
        return buffer;
      } catch (err) {
        const label = instance.replace('https://', '');
        errors.push(`${label}: ${err.message}`);
        console.warn(`[COBALT] ${instance} failed:`, err.message);
      }
    }
  }

  throw new Error(`All Cobalt instances failed — ${errors.join(' | ')}`);
}

async function downloadFromYtdl(url) {
  const { looksLikeAudio } = require('./voice');
  let ytdl;
  try {
    ytdl = require('@distube/ytdl-core');
  } catch (_) {
    throw new Error('@distube/ytdl-core not installed');
  }

  const info = await ytdl.getInfo(url);
  let format = null;
  try {
    format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });
  } catch (_) {}
  if (!format || !format.url) {
    try {
      format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    } catch (_) {}
  }
  if (!format || !format.url) {
    throw new Error('no downloadable audio stream found');
  }

  const headers = {};
  if (ytdl.userAgent) headers['User-Agent'] = ytdl.userAgent;
  if (format.headers) {
    Object.assign(headers, format.headers);
  }

  const buffer = await requestBuffer(format.url, { headers, timeoutMs: 60000 });
  if (!buffer.length || buffer.length < 512) {
    throw new Error('downloaded file is empty');
  }
  if (!looksLikeAudio(buffer)) {
    throw new Error('downloaded file is not valid audio');
  }
  return buffer;
}

async function downloadWithFallback(url, downloadMode) {
  const attempts = [];

  try {
    return await downloadFromCobalt(url, downloadMode);
  } catch (err) {
    attempts.push(`cobalt: ${err.message}`);
  }

  // ytdl only serves direct audio; the video path stays cobalt-only.
  if ((downloadMode || 'audio') === 'audio') {
    try {
      return await downloadFromYtdl(url);
    } catch (err) {
      attempts.push(`ytdl: ${err.message}`);
    }
  }

  throw new Error(attempts.join(' || '));
}

async function downloadYoutubeAudio(meta) {
  return downloadWithFallback(meta.url, 'audio');
}

async function downloadYoutubeVideo(meta) {
  return downloadWithFallback(meta.url, 'auto');
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
  _requestBuffer: requestBuffer,
};
