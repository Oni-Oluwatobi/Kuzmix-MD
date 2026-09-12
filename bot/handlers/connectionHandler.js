const { DisconnectReason } = require('@whiskeysockets/baileys');
const config = require('../config');

class ConnectionHandler {
  constructor() {
    this.reconnectAttempts = 0;
    this.maxRetries = config.reconnectMaxRetries || 10;
  }

  decodeDisconnectReason(error) {
    const statusCode = error?.output?.statusCode;
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

  handleUpdate(update, onRestartCallback) {
    const { connection, lastDisconnect } = update;

    if (connection === 'connecting') {
      console.log('[KUZMIX] 🟡 Connecting to WhatsApp Multi-Device servers...');
    }

    if (connection === 'open') {
      this.reconnectAttempts = 0;
      console.log('========================================================');
      console.log(`[KUZMIX] 🟢 WHATSAPP CONNECTION OPEN & AUTHENTICATED!`);
      console.log(`[KUZMIX] Bot: ${config.botName}`);
      console.log(`[KUZMIX] Active Prefix: "${config.prefix}"`);
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
        console.error('[KUZMIX] ❌ Session has been permanently unlinked by WhatsApp.');
        return;
      }

      this.reconnectAttempts++;
      if (this.reconnectAttempts > this.maxRetries) {
        console.error(`[KUZMIX] ❌ Reconnect failed after ${this.maxRetries} attempts.`);
        return;
      }

      const delayMs = Math.min(config.reconnectBaseDelayMs * Math.pow(1.5, this.reconnectAttempts - 1), 30000);
      console.log(`[KUZMIX] 🔄 Reconnecting attempt (${this.reconnectAttempts}/${this.maxRetries}) in ${Math.round(delayMs / 1000)}s...`);

      setTimeout(() => {
        if (typeof onRestartCallback === 'function') onRestartCallback();
      }, delayMs);
    }
  }
}

module.exports = new ConnectionHandler();
