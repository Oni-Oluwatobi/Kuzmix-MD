// Force ws to use pure-JS buffer handling (prevents "b.mask" crash on Node 24)
process.env.WS_NO_BUFFER_UTIL = '1';

const { DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const config = require('../config');

class ConnectionHandler {
  constructor() {
    this.reconnectAttempts = new Map();
    this.reconnectTimers = new Map();
    this.maxRetries = config.reconnectMaxRetries || 10;
  }

  decodeDisconnectReason(error) {
    if (!error) return { statusCode: undefined, reasonText: 'Unknown connection error' };
    if (typeof error === 'string') return { statusCode: undefined, reasonText: error };

    const statusCode = error?.output?.statusCode ?? error?.statusCode ?? error?.code;
    let reasonText = 'Unknown connection error';

    switch (statusCode) {
      case DisconnectReason.badSession:
        reasonText = 'Bad Session File - Credentials corrupted, re-pair required';
        break;
      case DisconnectReason.connectionClosed:
        reasonText = 'Connection closed unexpectedly';
        break;
      case DisconnectReason.connectionLost:
        reasonText = 'Connection lost from network timeout';
        break;
      case DisconnectReason.connectionReplaced:
        reasonText = 'Connection replaced - Another session opened elsewhere';
        break;
      case DisconnectReason.loggedOut:
        reasonText = 'Logged out by WhatsApp. Device unlinked';
        break;
      case DisconnectReason.restartRequired:
        reasonText = 'Restart required by WhatsApp server';
        break;
      case DisconnectReason.timedOut:
        reasonText = 'Connection timed out';
        break;
      case 401:
        reasonText = 'Unauthorized (401) - Authentication revoked';
        break;
      case 403:
        reasonText = 'Forbidden (403) - WhatsApp account flagged';
        break;
      case 515:
        reasonText = 'Restart required (515) - Stream renegotiation required';
        break;
      default:
        reasonText = error?.message || `Status code: ${statusCode || 'undefined'}`;
    }

    return { statusCode, reasonText };
  }

  clearReconnect(sessionId) {
    if (this.reconnectTimers.has(sessionId)) {
      clearTimeout(this.reconnectTimers.get(sessionId));
      this.reconnectTimers.delete(sessionId);
    }
    this.reconnectAttempts.delete(sessionId);
  }

  handleUpdate(update, onRestartCallback, sessionId = 'default') {
    const { connection, lastDisconnect } = update;

    if (connection === 'connecting') {
      console.log('[KUZMIX] 🟡 Connecting to WhatsApp Multi-Device servers...');
    }

    if (connection === 'open') {
      if (this.reconnectTimers.has(sessionId)) {
        clearTimeout(this.reconnectTimers.get(sessionId));
        this.reconnectTimers.delete(sessionId);
      }
      this.reconnectAttempts.set(sessionId, 0);
      // Reset runtime safety flags to safe env-derived defaults after (re)connect
      config.resetSafetyFlags();
      console.log('========================================================');
      console.log(`[KUZMIX] 🟢 WHATSAPP CONNECTION OPEN & AUTHENTICATED!`);
      console.log(`[KUZMIX] Bot: ${config.botName}`);
      console.log(`[KUZMIX] Active Prefix: "${config.prefix}"`);
      console.log(`[KUZMIX] Safety: private=${config.privateMode} public=${config.publicMode} strict=${config.strictMode}`);
      console.log('========================================================');
    }

    if (connection === 'close') {
      const err = lastDisconnect?.error;
      const { statusCode, reasonText } = this.decodeDisconnectReason(err);

      console.log('--------------------------------------------------------');
      console.log(`[KUZMIX] 🔴 Connection closed`);
      console.log(`[KUZMIX] Status Code: ${statusCode}`);
      console.log(`[KUZMIX] Reason: ${reasonText}`);
      console.log('--------------------------------------------------------');

      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        this.clearReconnect(sessionId);
        console.error('[KUZMIX] ❌ Session has been permanently unlinked by WhatsApp.');
        console.error(`[KUZMIX] 🧹 Removing dead session at: ${config.sessionDir}`);
        try {
          fs.rmSync(config.sessionDir, { recursive: true, force: true });
          console.error('[KUZMIX] ✅ Dead session cleared. Re-pair using: node index.js pair <phoneNumber>');
        } catch (cleanErr) {
          console.error('[KUZMIX] ⚠️  Could not clear session:', cleanErr.message);
        }
        return;
      }

      const attempts = (this.reconnectAttempts.get(sessionId) || 0) + 1;
      this.reconnectAttempts.set(sessionId, attempts);

      const isRestart = statusCode === DisconnectReason.restartRequired || statusCode === 515;
      let delayMs;

      if (isRestart) {
        delayMs = 0;
      } else if (attempts <= this.maxRetries) {
        // Normal backoff: 3s, 4.5s, 6.75s ... up to 30s
        delayMs = Math.min(config.reconnectBaseDelayMs * Math.pow(1.5, attempts - 1), 30000);
      } else {
        // After max retries, keep trying but with 60s cooldown
        delayMs = 60000;
        console.log(`[KUZMIX] 🔄 Reconnect attempt ${attempts} — retrying in 60s...`);
      }

      if (!isRestart) {
        console.log(
          `[KUZMIX] 🔄 Reconnecting attempt ${attempts} in ${Math.round(delayMs / 1000)}s...`
        );
      } else {
        console.log(`[KUZMIX] 🔄 Reconnecting immediately with new session credentials...`);
      }

      // One pending reconnect timer per session (dedupe close events)
      if (this.reconnectTimers.has(sessionId)) {
        clearTimeout(this.reconnectTimers.get(sessionId));
      }
      const timer = setTimeout(() => {
        this.reconnectTimers.delete(sessionId);
        if (typeof onRestartCallback === 'function') onRestartCallback();
      }, delayMs);
      this.reconnectTimers.set(sessionId, timer);
    }
  }
}

module.exports = new ConnectionHandler();
