const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
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
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    generateHighQualityLinkPreview: true,
    browser: ['Kuzmix-MD', 'Chrome', '120.0.0'],
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
