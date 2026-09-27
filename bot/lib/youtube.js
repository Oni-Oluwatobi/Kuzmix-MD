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
const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawn } = require('child_process');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

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

        const buffer = await requestBuffer(fileUrl, {
          headers: { 'User-Agent': UA, 'Accept': '*/*' },
          timeoutMs: 90000,
        });
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

// --- yt-dlp fallback (most reliable on server IPs where YouTube bot-checks
// ytdl-core and cobalt instances go down). Downloads the standalone binary
// once per boot and caches it in the OS temp dir. ---
const YTDLP_ASSET =
  process.platform === 'win32'
    ? 'yt-dlp.exe'
    : process.platform === 'darwin'
      ? 'yt-dlp_macos'
      : 'yt-dlp_linux';
const YTDLP_URL = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${YTDLP_ASSET}`;

let ytdlpPathPromise = null;

function ytDlpOnPath() {
  return new Promise((resolve) => {
    const probe = spawn('yt-dlp', ['--version'], { stdio: 'ignore', windowsHide: true });
    probe.on('error', () => resolve(false));
    probe.on('exit', (code) => resolve(code === 0));
  });
}

async function ensureYtDlp() {
  if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;
  if (!ytdlpPathPromise) {
    ytdlpPathPromise = (async () => {
      if (await ytDlpOnPath()) return 'yt-dlp';

      const dir = path.join(os.tmpdir(), 'kuzmix-md');
      const bin = path.join(dir, YTDLP_ASSET);
      if (fs.existsSync(bin) && fs.statSync(bin).size > 1024 * 1024) {
        return bin;
      }

      console.log('[YTDLP] downloading standalone binary...');
      const buf = await requestBuffer(YTDLP_URL, {
        headers: { 'User-Agent': UA },
        timeoutMs: 120000,
        maxBytes: 150 * 1024 * 1024,
      });
      if (buf.length < 1024 * 1024) {
        throw new Error('yt-dlp binary download looks truncated');
      }
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(bin, buf);
      if (process.platform !== 'win32') fs.chmodSync(bin, 0o755);
      console.log(`[YTDLP] ready at ${bin} (${buf.length} bytes)`);
      return bin;
    })().catch((err) => {
      ytdlpPathPromise = null;
      throw err;
    });
  }
  return ytdlpPathPromise;
}

function runYtDlpToBuffer(bin, args, timeoutMs, maxBytes) {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { windowsHide: true });
    const chunks = [];
    let total = 0;
    let stderr = '';
    let settled = false;
    const done = (fn, val) => {
      if (!settled) {
        settled = true;
        fn(val);
      }
    };
    const timer = setTimeout(() => {
      try { proc.kill(); } catch (_) {}
      done(reject, new Error('yt-dlp timed out'));
    }, timeoutMs);
    proc.stdout.on('data', (c) => {
      total += c.length;
      if (total > maxBytes) {
        try { proc.kill(); } catch (_) {}
        done(reject, new Error('download exceeds size limit'));
        return;
      }
      chunks.push(c);
    });
    proc.stderr.on('data', (c) => {
      if (stderr.length < 4000) stderr += c.toString('utf8');
    });
    proc.on('error', (e) => {
      clearTimeout(timer);
      done(reject, e);
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        const buf = Buffer.concat(chunks);
        if (buf.length < 512) {
          done(reject, new Error('yt-dlp produced empty output'));
        } else {
          done(resolve, buf);
        }
      } else {
        const tail = stderr.split('\n').filter(Boolean).slice(-2).join(' | ').slice(0, 300);
        done(reject, new Error(`yt-dlp exited ${code}: ${tail || 'no output'}`));
      }
    });
  });
}

async function runYtDlpToFile(bin, args, timeoutMs) {
  const tmp = path.join(os.tmpdir(), `kuzmix-dl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`);
  try {
    await new Promise((resolve, reject) => {
      const proc = spawn(bin, [...args, '-o', tmp], { windowsHide: true });
      let stderr = '';
      let settled = false;
      const done = (fn, val) => {
        if (!settled) {
          settled = true;
          fn(val);
        }
      };
      const timer = setTimeout(() => {
        try { proc.kill(); } catch (_) {}
        done(reject, new Error('yt-dlp timed out'));
      }, timeoutMs);
      proc.stdout.resume();
      proc.stderr.on('data', (c) => {
        if (stderr.length < 4000) stderr += c.toString('utf8');
      });
      proc.on('error', (e) => {
        clearTimeout(timer);
        done(reject, e);
      });
      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) done(resolve);
        else {
          const tail = stderr.split('\n').filter(Boolean).slice(-2).join(' | ').slice(0, 300);
          done(reject, new Error(`yt-dlp exited ${code}: ${tail || 'no output'}`));
        }
      });
    });
    const buf = fs.readFileSync(tmp);
    if (buf.length < 512) throw new Error('yt-dlp produced empty output');
    if (buf.length > 100 * 1024 * 1024) throw new Error('video exceeds WhatsApp size limit');
    return buf;
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
}

async function downloadFromYtDlp(url, downloadMode) {
  const bin = await ensureYtDlp();

  if (downloadMode === 'auto') {
    return runYtDlpToFile(
      bin,
      [
        '--no-playlist',
        '--no-warnings',
        '--no-part',
        '-f',
        'bv*[height<=720][ext=mp4]+ba[ext=m4a]/bv*[height<=720]/b[ext=mp4]/b',
        '--merge-output-format',
        'mp4',
        url,
      ],
      300000
    );
  }

  const buf = await runYtDlpToBuffer(
    bin,
    ['--no-playlist', '--no-warnings', '--no-part', '-f', 'bestaudio/best', '-o', '-', url],
    180000,
    60 * 1024 * 1024
  );
  const { looksLikeAudio } = require('./voice');
  if (!looksLikeAudio(buf)) {
    throw new Error('yt-dlp output is not valid audio');
  }
  return buf;
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

  try {
    return await downloadFromYtDlp(url, downloadMode);
  } catch (err) {
    attempts.push(`yt-dlp: ${err.message}`);
  }

  // ytdl-core only serves audio and is last (bot-checks server IPs).
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
  _downloadFromYtDlp: downloadFromYtDlp,
  _runYtDlpToBuffer: runYtDlpToBuffer,
  _streamToBuffer: streamToBuffer,
  _requestBuffer: requestBuffer,
};
