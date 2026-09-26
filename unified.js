#!/usr/bin/env node

process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8 = '1';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.KUZMIX_AUTH_DIR = process.env.KUZMIX_AUTH_DIR || require('path').join(__dirname, 'bot', 'session');

// Must load before anything else: silences raw libsignal console dumps
// (they include session private keys and spam the logs on every session reset)
require('./bot/lib/silenceLibsignal');

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

// 2. Start HTTP server with health check + Next.js portal
const PORT = process.env.PORT || 3000;
const next = require('next');
const { createServer } = require('http');
const { parse } = require('url');

const nextBuildDir = path.join(PORTAL_DIR, '.next');
const useDev = !fs.existsSync(nextBuildDir);
if (useDev) {
  console.log('[BOOT] ⚠️  .next not found — using dev mode (slower first load)');
}

const app = next({ dev: useDev, dir: PORTAL_DIR });
const handle = app.getRequestHandler();

// Prepare Next.js immediately. Portal requests below WAIT on this promise —
// delegating before prepare() resolves throws "prepare() must be called".
const portalReady = app.prepare().then(() => {
  console.log('[BOOT] ✅ Next.js pairing portal ready');
  console.log('[BOOT] Both services are now running!');
});
portalReady.catch(err => {
  console.error('[BOOT] ⚠️ Next.js prepare failed:', err && err.message);
});

// Start HTTP server IMMEDIATELY — health check works even while Next.js is building
const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);

  // Health check — always available, no Next.js dependency
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }

  // Delegate to Next.js once prepared; until then the request queues.
  portalReady
    .then(() => handle(req, res, parsedUrl))
    .catch(err => {
      console.error('[BOOT] Portal request failed:', err && err.message);
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        res.end('Portal is starting up. Please retry in a few seconds.');
      }
    });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`[BOOT] ✅ HTTP server running on http://0.0.0.0:${PORT}`);
  console.log(`[BOOT]    Health: http://localhost:${PORT}/health`);
  console.log(`[BOOT]    Portal: http://localhost:${PORT}/pair`);
  console.log('');
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`[BOOT] ${signal} received — shutting down gracefully...`);
  server.close(() => {
    try {
      const { getAllSockets } = require('./bot/bot');
      for (const { sock } of getAllSockets()) {
        try { sock.end(undefined); } catch (_) {}
      }
    } catch (_) {}
    setTimeout(() => process.exit(0), 1000);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
