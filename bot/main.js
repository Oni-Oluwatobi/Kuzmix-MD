const { startBot, getAllSockets } = require('./bot');
const fs = require('fs');
const path = require('path');
const config = require('./config');
require('./lib/silenceLibsignal');

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

// Check if any sessions exist (legacy or multi-session)
function hasAnySessions() {
  // Legacy single session
  if (fs.existsSync(path.join(config.sessionDir, 'creds.json'))) return true;

  // Multi-session directories
  if (fs.existsSync(config.sessionsRoot)) {
    const dirs = fs.readdirSync(config.sessionsRoot, { withFileTypes: true });
    return dirs.some(d => d.isDirectory() && fs.existsSync(path.join(config.sessionsRoot, d.name, 'creds.json')));
  }

  return false;
}

// Session watcher: detect when pairing portal creates new session files
function watchForSession() {
  if (botRunning) return;

  // Check every 5 seconds for new session files
  const watcher = setInterval(() => {
    if (botRunning) {
      clearInterval(watcher);
      return;
    }

    if (hasAnySessions()) {
      console.log('[KUZMIX] 📱 Session files detected! Starting bot...');
      clearInterval(watcher);
      restartCount = 0;
      startBotWithRetry();
    }
  }, 5000);

  console.log('[KUZMIX] 👀 Watching for session files...');
}

// Watchdog: if bot was running but all sockets died, restart
let watchdogRunning = false;
function startWatchdog() {
  if (watchdogRunning) return;
  watchdogRunning = true;
  setInterval(() => {
    if (!botRunning) return;
    const sockets = getAllSockets();
    if (sockets.length === 0) {
      console.log('[KUZMIX] ⚠️  Watchdog: no active sockets — restarting...');
      botRunning = false;
      restartCount = 0;
      startBotWithRetry();
    }
  }, 30000);
}

// Only auto-start if run directly (not when required by unified.js)
if (require.main === module) {
  if (hasAnySessions()) {
    startBotWithRetry();
  } else {
    console.log('\n⚠️  NO ACTIVE WHATSAPP SESSIONS FOUND');
    console.log('Please pair your WhatsApp account first via one of the following methods:\n');
    console.log('1. Web Pairing Portal: Open /pair in your browser');
    console.log('2. Terminal CLI Pair: node index.js pair <phoneNumber>');
    console.log('3. WhatsApp Command: .pair <phoneNumber>\n');
    watchForSession();
  }
}

module.exports = { startBotWithRetry, watchForSession, startWatchdog };
