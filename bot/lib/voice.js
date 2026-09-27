/**
 * Kuzmix-MD Voice Utilities
 *
 * WhatsApp only reliably plays push-to-talk (voice note) messages encoded as
 * OGG/Opus. Sending raw MP3/M4A with ptt:true produces an empty voice note and
 * the "This audio file cannot be played. Please update WhatsApp" error.
 *
 * These helpers convert any source audio into a WhatsApp-compatible OGG/Opus
 * buffer using ffmpeg, with safe fallbacks when conversion is unavailable.
 */

const { spawn } = require('child_process');

let cachedFfmpegPath;

function resolveFfmpeg() {
  if (cachedFfmpegPath !== undefined) return cachedFfmpegPath;
  cachedFfmpegPath = null;
  try {
    const installer = require('@ffmpeg-installer/ffmpeg');
    if (installer && installer.path) cachedFfmpegPath = installer.path;
  } catch (_) {}
  if (!cachedFfmpegPath) {
    try {
      const staticPath = require('ffmpeg-static');
      if (staticPath) cachedFfmpegPath = staticPath;
    } catch (_) {}
  }
  if (!cachedFfmpegPath) cachedFfmpegPath = 'ffmpeg';
  return cachedFfmpegPath;
}

function looksLikeAudio(buf) {
  if (!buf || buf.length < 128) return false;
  if (buf.length >= 4 && buf.toString('latin1', 0, 4) === 'OggS') return true; // OGG
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true; // ID3 (MP3)
  if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return true; // MP3 frame sync
  if (buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WAVE') return true;
  if (buf.toString('latin1', 0, 4) === 'fLaC') return true;
  if (buf.toString('latin1', 4, 8) === 'ftyp') return true; // MP4/M4A/AAC
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return true; // WebM
  return false;
}

function detectAudioMime(buf) {
  if (!buf || buf.length < 12) return 'audio/mpeg';
  if (buf.toString('latin1', 0, 4) === 'OggS') return 'audio/ogg; codecs=opus';
  if (buf.toString('latin1', 4, 8) === 'ftyp') return 'audio/mp4';
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'audio/webm';
  if (buf.toString('latin1', 0, 4) === 'RIFF') return 'audio/wav';
  if (buf.toString('latin1', 0, 4) === 'fLaC') return 'audio/flac';
  return 'audio/mpeg';
}

function runFfmpeg(args, input, timeoutMs) {
  return new Promise((resolve, reject) => {
    let bin;
    try {
      bin = resolveFfmpeg();
    } catch (e) {
      return reject(e);
    }

    const stdout = [];
    let stderr = '';
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    let proc;
    try {
      proc = spawn(bin, args, { windowsHide: true });
    } catch (e) {
      return finish(reject, e);
    }

    const timer = setTimeout(() => {
      try { proc.kill(); } catch (_) {}
      finish(reject, new Error('ffmpeg timed out'));
    }, timeoutMs || 45000);

    proc.on('error', (e) => {
      clearTimeout(timer);
      finish(reject, e);
    });
    proc.stdout.on('data', (chunk) => stdout.push(chunk));
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 4000) stderr = stderr.slice(0, 4000);
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) finish(resolve, Buffer.concat(stdout));
      else finish(reject, new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-300).trim()}`));
    });
    proc.stdin.on('error', () => {});
    proc.stdin.end(input);
  });
}

/**
 * Convert an audio buffer into WhatsApp-compatible OGG/Opus.
 * Returns { buffer, mimetype: 'audio/ogg; codecs=opus' }.
 * Throws when the source is not audio or conversion fails.
 */
async function toWhatsAppVoice(input, options = {}) {
  const { music = false } = options;

  if (!looksLikeAudio(input)) {
    throw new Error('Source is not a valid audio file');
  }

  if (input.toString('latin1', 0, 4) === 'OggS') {
    return { buffer: input, mimetype: 'audio/ogg; codecs=opus' };
  }

  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-i', 'pipe:0',
    '-c:a', 'libopus',
    '-b:a', music ? '96k' : '40k',
    '-ac', music ? '2' : '1',
    '-ar', '48000',
    '-f', 'ogg',
    'pipe:1',
  ];

  const out = await runFfmpeg(args, input, 60000);
  if (!out.length || out.toString('latin1', 0, 4) !== 'OggS') {
    throw new Error('ffmpeg produced an empty voice note');
  }
  return { buffer: out, mimetype: 'audio/ogg; codecs=opus' };
}

module.exports = {
  resolveFfmpeg,
  looksLikeAudio,
  detectAudioMime,
  toWhatsAppVoice,
};
