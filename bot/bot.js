// Force ws to use pure-JS buffer handling (prevents "b.mask is not a function" on Node 24)
process.env.WS_NO_BUFFER_UTIL = '1';

const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, Browsers } = require('@whiskeysockets/baileys');
const config = require('./config');
const logger = require('./lib/logger');
const messageStore = require('./lib/messageStore');
require('./lib/silenceLibsignal');
const { purgeSignalSessions } = require('./lib/healSignalSessions');
const connectionHandler = require('./handlers/connectionHandler');
const commandHandler = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');

const sockets = new Map();
const startingSessions = new Map();

function getPhoneDir(phone) {
  return path.join(config.sessionsRoot, phone);
}

function getSessionAccountNumber(dir) {
  try {
    const creds = JSON.parse(fs.readFileSync(path.join(dir, 'creds.json'), 'utf8'));
    const id = (creds && creds.me && creds.me.id) || '';
    return String(id).split('@')[0].split(':')[0].replace(/\D/g, '') || null;
  } catch (_) {
    return null;
  }
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

  // Dedupe by account number: two sessions for the SAME account would open two
  // sockets with the same credentials, which desyncs the signal sessions
  // ("Waiting for this message" / "closed session" churn). Keep the newest creds.
  const byAccount = new Map();
  const deduped = [];
  const credsAge = (dir) => {
    try { return fs.statSync(path.join(dir, 'creds.json')).mtimeMs; } catch (_) { return 0; }
  };

  for (const d of dirs) {
    const acct = getSessionAccountNumber(d.dir);
    if (!acct) {
      deduped.push(d);
      continue;
    }
    const existing = byAccount.get(acct);
    if (!existing) {
      byAccount.set(acct, d);
      deduped.push(d);
      continue;
    }
    if (credsAge(d.dir) > credsAge(existing.dir)) {
      console.warn(`[KUZMIX] Duplicate session for +${acct}: keeping ${d.dir}, ignoring ${existing.dir}`);
      const idx = deduped.indexOf(existing);
      if (idx >= 0) deduped.splice(idx, 1);
      byAccount.set(acct, d);
      deduped.push(d);
    } else {
      console.warn(`[KUZMIX] Duplicate session for +${acct}: keeping ${existing.dir}, ignoring ${d.dir}`);
    }
  }

  return deduped;
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
  // Single-flight: concurrent calls (watchdog + reconnect timer + .pair) must
  // never create two sockets for the same account.
  if (startingSessions.has(phone)) return startingSessions.get(phone);

  const task = startSessionExclusive(phone, sessionDir)
    .finally(() => startingSessions.delete(phone));
  startingSessions.set(phone, task);
  return task;
}

async function startSessionExclusive(phone, sessionDir) {
  if (sockets.has(phone)) {
    const old = sockets.get(phone);
    // Ignore future close events from the socket we are about to replace,
    // otherwise its teardown schedules ANOTHER reconnect that kills the new socket.
    old._replaced = true;
    connectionHandler.clearReconnect(phone);
    try { old.end(undefined); } catch (_) {}
    sockets.delete(phone);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`[KUZMIX] Starting session for +${phone} from: ${sessionDir}`);

  // Heal: persisted signal sessions can be poisoned (stuck "Waiting for this
  // message"). Clear them so all sessions rebuild fresh from prekey bundles.
  const cleared = purgeSignalSessions(sessionDir);
  if (cleared > 0) {
    console.log(`[KUZMIX] Signal heal: cleared ${cleared} stale session file(s) for +${phone}`);
  }

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
    if (sock._replaced) return;
    if (update.connection === 'open') {
      console.log(`[KUZMIX] 🟢 +${phone} connected`);
    }
    connectionHandler.handleUpdate(update, () => {
      startSession(phone, sessionDir).catch(err => console.error(`[KUZMIX RESTART ${phone}]`, err));
    }, phone);
  });

  sock.ev.on('messages.upsert', (m) => {
    if (sock._replaced) return;
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
