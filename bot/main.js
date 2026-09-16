const { startBot } = require('./bot');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Global crash handlers — prevent silent exits
process.on('uncaughtException', (err) => {
  console.error('[KUZMIX CRITICAL ERROR]', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('[KUZMIX UNHANDLED PROMISE]', reason);
});

// Memory monitoring
setInterval(() => {
  const mem = process.memoryUsage();
  const usedMB = Math.round(mem.rss / 1024 / 1024);
  if (usedMB > 800) {
    console.warn(`[KUZMIX MEMORY WARNING] Using ${usedMB}MB RAM`);
  }
}, 60000);

// Auto-restart on crash (with backoff)
let restartCount = 0;
const MAX_RESTARTS = 10;
let botRunning = false;

function startBotWithRetry() {
  startBot()
    .then(() => {
      restartCount = 0;
      botRunning = true;
      console.log('[KUZMIX] Bot started successfully');
      startWatchdog();
    })
    .catch((err) => {
      console.error('[KUZMIX FATAL ERROR ON STARTUP]', err.message);
      restartCount++;
      if (restartCount <= MAX_RESTARTS) {
        const delay = Math.min(restartCount * 5000, 60000);
        console.log(`[KUZMIX] Restarting in ${delay / 1000}s (attempt ${restartCount}/${MAX_RESTARTS})...`);
        setTimeout(startBotWithRetry, delay);
      } else {
        console.error('[KUZMIX] Max restarts reached. Bot will not restart.');
      }
    });
}

// Session watcher: detect when pairing portal creates new session files
function watchForSession() {
  if (botRunning) return;

  const sessionDir = config.sessionDir;
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Check every 5 seconds for new session files
  const watcher = setInterval(() => {
    if (botRunning) {
      clearInterval(watcher);
      return;
    }

    try {
      const files = fs.readdirSync(sessionDir);
      const hasCreds = files.some(f => f.endsWith('.json') && f !== 'bot.sock');
      if (hasCreds) {
        console.log('[KUZMIX] 📱 Session files detected! Starting bot...');
        clearInterval(watcher);
        restartCount = 0;
        startBotWithRetry();
      }
    } catch (_) {}
  }, 5000);

  console.log('[KUZMIX] 👀 Watching for session files in: ' + sessionDir);
}

// Watchdog: if bot was running but socket died silently, restart
let watchdogRunning = false;
function startWatchdog() {
  if (watchdogRunning) return;
  watchdogRunning = true;
  const { getSocket } = require('./bot');
  setInterval(() => {
    if (!botRunning) return;
    const sock = getSocket();
    if (!sock || !sock.user) {
      console.log('[KUZMIX] ⚠️  Watchdog: socket lost — restarting...');
      botRunning = false;
      restartCount = 0;
      startBotWithRetry();
    }
  }, 30000);
}

// Only auto-start if run directly (not when required by unified.js)
if (require.main === module) {
  const { isSessionValid } = require('./lib/helpers');
  if (isSessionValid(config.sessionDir)) {
    startBotWithRetry();
  } else {
    console.log('\n⚠️  NO ACTIVE WHATSAPP SESSION FOUND in: ' + config.sessionDir);
    console.log('Please pair your WhatsApp account first via one of the following methods:\n');
    console.log('1. Web Pairing Portal: Open /pair in your browser');
    console.log('2. Terminal CLI Pair: node index.js pair <phoneNumber>');
    console.log('3. WhatsApp Command: .pair <phoneNumber>\n');
    watchForSession();
  }
}

module.exports = { startBotWithRetry, watchForSession, startWatchdog };
