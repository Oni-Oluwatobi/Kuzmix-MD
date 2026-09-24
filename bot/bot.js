// Force ws to use pure-JS buffer handling (prevents "b.mask is not a function" on Node 24)
process.env.WS_NO_BUFFER_UTIL = '1';

const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, Browsers } = require('@whiskeysockets/baileys');
const config = require('./config');
const logger = require('./lib/logger');
const messageStore = require('./lib/messageStore');
const connectionHandler = require('./handlers/connectionHandler');
const commandHandler = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');

const sockets = new Map();

function getPhoneDir(phone) {
  return path.join(config.sessionsRoot, phone);
}

function getAllSessionDirs() {
  const dirs = [];

  // Legacy single session
  const legacyCreds = path.join(config.sessionDir, 'creds.json');
  if (fs.existsSync(legacyCreds)) {
    dirs.push({ phone: 'owner', dir: config.sessionDir });
  }

  // Multi-session directories
  if (fs.existsSync(config.sessionsRoot)) {
    const entries = fs.readdirSync(config.sessionsRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const credsPath = path.join(config.sessionsRoot, entry.name, 'creds.json');
        if (fs.existsSync(credsPath)) {
          dirs.push({ phone: entry.name, dir: path.join(config.sessionsRoot, entry.name) });
        }
      }
    }
  }

  return dirs;
}

async function startBot() {
  commandHandler.loadCommands();

  const sessions = getAllSessionDirs();
  console.log(`[KUZMIX] Found ${sessions.length} session(s) to load`);

  if (sessions.length === 0) {
    console.log('[KUZMIX] No sessions found. Use .pair to link a WhatsApp number.');
    return;
  }

  for (const sess of sessions) {
    await startSession(sess.phone, sess.dir).catch(err => {
      console.error(`[KUZMIX] Failed to start session ${sess.phone}:`, err.message);
    });
  }
}

async function startSession(phone, sessionDir) {
  if (sockets.has(phone)) {
    try { sockets.get(phone).end(undefined); } catch (_) {}
    sockets.delete(phone);
  }
  connectionHandler.clearReconnect(phone);

  console.log(`[KUZMIX] Starting session for +${phone} from: ${sessionDir}`);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestWaWebVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: true,
    browser: Browsers.appropriate('Chrome'),
    syncFullHistory: false,
  });

  // Record every sent message ID so incoming echoes of our own messages are ignored
  const originalSend = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    const sent = await originalSend(jid, content, options);
    if (sent && sent.key && sent.key.id) messageStore.markSent(sent.key.id);
    return sent;
  };

  sockets.set(phone, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    if (update.connection === 'open') {
      console.log(`[KUZMIX] 🟢 +${phone} connected`);
    }
    connectionHandler.handleUpdate(update, () => {
      startSession(phone, sessionDir).catch(err => console.error(`[KUZMIX RESTART ${phone}]`, err));
    }, phone);
  });

  sock.ev.on('messages.upsert', (m) => {
    if (m.type !== 'notify') return;
    handleMessage(sock, m).catch(err => console.error(`[KUZMIX MSG ${phone}]`, err));
  });

  return sock;
}

function getSocket(phone) {
  return sockets.get(phone) || null;
}

function getAllSockets() {
  return Array.from(sockets.entries()).map(([phone, sock]) => ({ phone, sock }));
}

module.exports = {
  startBot,
  startSession,
  getSocket,
  getAllSockets,
  getPhoneDir,
};
