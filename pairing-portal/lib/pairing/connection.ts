import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { getIsolatedSessionDir, getSharedAuthDir, copyCredentialsToShared } from './auth';

interface PairingSession {
  phone: string;
  code: string | null;
  status: 'idle' | 'requesting' | 'verifying' | 'connected' | 'disconnected' | 'error';
  statusCode?: number;
  disconnectReason?: string;
  socket: ReturnType<typeof makeWASocket> | null;
  createdAt: number;
}

const activeSessions = new Map<string, PairingSession>();

export function decodeDisconnectReason(error: any): { statusCode?: number; reasonText: string } {
  const statusCode = error?.output?.statusCode;
  let reasonText = 'Unknown connection error';

  switch (statusCode) {
    case DisconnectReason.badSession:
      reasonText = 'Bad Session File - Credentials corrupted';
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
      reasonText = 'Logged out by WhatsApp - Device unlinked';
      break;
    case DisconnectReason.restartRequired:
      reasonText = 'Restart required by WhatsApp';
      break;
    case DisconnectReason.timedOut:
      reasonText = 'Connection timed out';
      break;
    case 401:
      reasonText = 'Unauthorized (401) - Auth key rejected';
      break;
    case 403:
      reasonText = 'Forbidden (403) - WhatsApp account banned or flagged';
      break;
    case 515:
      reasonText = 'Stream restart required (515) - Baileys renegotiating';
      break;
    default:
      reasonText = error?.message || `Status: ${statusCode || 'undefined'}`;
  }

  return { statusCode, reasonText };
}

export async function requestPairing(phone: string): Promise<{ success: boolean; code?: string; error?: string; expiresIn?: number }> {
  const cleanPhone = phone.replace(/\D/g, '');

  if (activeSessions.has(cleanPhone)) {
    const existing = activeSessions.get(cleanPhone)!;
    if (existing.status === 'verifying' && existing.code && (Date.now() - existing.createdAt < 120000)) {
      return {
        success: true,
        code: existing.code,
        expiresIn: Math.max(0, Math.floor((120000 - (Date.now() - existing.createdAt)) / 1000)),
      };
    }
    cleanupSession(cleanPhone, 'Resetting for new pairing attempt');
  }

  const sessionDir = getIsolatedSessionDir(cleanPhone);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: 'silent' });

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ['Kuzmix-MD', 'Chrome', '120.0.0'],
    syncFullHistory: false,
  });

  const sessionRecord: PairingSession = {
    phone: cleanPhone,
    code: null,
    status: 'requesting',
    socket: sock,
    createdAt: Date.now(),
  };

  activeSessions.set(cleanPhone, sessionRecord);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      sessionRecord.status = 'connected';
      console.log(`[PAIRING PORTAL] Phone +${cleanPhone} connected! Copying creds to shared auth...`);
      const sharedDir = getSharedAuthDir();
      copyCredentialsToShared(sessionDir, sharedDir);
      console.log(`[PAIRING PORTAL] Saved authentication to ${sharedDir}`);
    }

    if (connection === 'close') {
      const { statusCode, reasonText } = decodeDisconnectReason(lastDisconnect?.error);
      sessionRecord.status = 'disconnected';
      sessionRecord.statusCode = statusCode;
      sessionRecord.disconnectReason = reasonText;
      console.log(`[PAIRING PORTAL] +${cleanPhone} closed: ${statusCode} (${reasonText})`);
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    const rawCode = await sock.requestPairingCode(cleanPhone);
    const formattedCode = rawCode.match(/.{1,4}/g)?.join('-') || rawCode;
    sessionRecord.code = formattedCode;
    sessionRecord.status = 'verifying';

    return {
      success: true,
      code: formattedCode,
      expiresIn: 120,
    };
  } catch (err: any) {
    sessionRecord.status = 'error';
    sessionRecord.disconnectReason = err?.message || 'Failed to request code';
    return {
      success: false,
      error: err?.message || 'Baileys could not request pairing code',
    };
  }
}

export function getSession(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  return activeSessions.get(cleanPhone) || null;
}

export function cleanupSession(phone: string, reason: string = 'cleanup') {
  const cleanPhone = phone.replace(/\D/g, '');
  const session = activeSessions.get(cleanPhone);
  if (session && session.socket) {
    try {
      session.socket.end(new Error(reason));
    } catch {}
  }
  activeSessions.delete(cleanPhone);
}
