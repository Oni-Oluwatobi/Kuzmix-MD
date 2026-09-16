#!/usr/bin/env node

process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8 = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.KUZMIX_AUTH_DIR = process.env.KUZMIX_AUTH_DIR || require('path').join(__dirname, 'bot', 'session');

const path = require('path');
const fs = require('fs');

const BOT_DIR = path.join(__dirname, 'bot');
const PORTAL_DIR = path.join(__dirname, 'pairing-portal');

console.log('╔══════════════════════════════════════════════════════╗');
console.log('║       KUZMIX-MD UNIFIED DAEMON v2.0                ║');
console.log('║       Developer: Oni Oluwatobi (The Kreadive Galaxy) ║');
console.log('╚══════════════════════════════════════════════════════╝');
console.log('');
console.log('[BOOT] Session dir:', process.env.KUZMIX_AUTH_DIR);
console.log('');

// Ensure session directory exists
if (!fs.existsSync(process.env.KUZMIX_AUTH_DIR)) {
  fs.mkdirSync(process.env.KUZMIX_AUTH_DIR, { recursive: true });
}

// 1. Start the WhatsApp bot
console.log('[BOOT] Starting WhatsApp bot...');
const { startBotWithRetry, watchForSession } = require('./bot/main');
const config = require('./bot/config');
const { isSessionValid } = require('./bot/lib/helpers');

if (isSessionValid(config.sessionDir)) {
  startBotWithRetry();
} else {
  console.log('[BOOT] ⚠️  No session found — bot will pair via portal');
  watchForSession();
}

// 2. Start the Next.js pairing portal
const PORT = process.env.PORT || 3000;
const next = require('next');
const { createServer } = require('http');
const { parse } = require('url');

// Check if .next exists (built on Render) or use dev mode
const nextBuildDir = path.join(PORTAL_DIR, '.next');
const useDev = !fs.existsSync(nextBuildDir);
if (useDev) {
  console.log('[BOOT] ⚠️  .next not found — using dev mode (slower first load)');
}

const app = next({ dev: useDev, dir: PORTAL_DIR });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] ✅ Pairing Portal running on http://0.0.0.0:${PORT}`);
    console.log(`[BOOT]    Pair URL: http://localhost:${PORT}/pair`);
    console.log('');
    console.log('[BOOT] Both services are now running!');
  });
});
