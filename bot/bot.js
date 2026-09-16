// Force ws to use pure-JS buffer handling (prevents "b.mask is not a function" on Node 24)
process.env.WS_NO_BUFFER_UTIL = '1';

const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, Browsers } = require('@whiskeysockets/baileys');
const config = require('./config');
const logger = require('./lib/logger');
const connectionHandler = require('./handlers/connectionHandler');
const commandHandler = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');

let currentSocket = null;

async function startBot() {
  console.log(`[KUZMIX] Loading bot session from: ${config.sessionDir}`);

  // Load commands
  commandHandler.loadCommands();

  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
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

  currentSocket = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    connectionHandler.handleUpdate(update, () => {
      startBot().catch(err => console.error('[KUZMIX RESTART ERROR]', err));
    });
  });

  sock.ev.on('messages.upsert', (m) => {
    handleMessage(sock, m).catch(err => console.error('[KUZMIX MSG ERROR]', err));
  });

  return sock;
}

module.exports = {
  startBot,
  getSocket: () => currentSocket,
};
