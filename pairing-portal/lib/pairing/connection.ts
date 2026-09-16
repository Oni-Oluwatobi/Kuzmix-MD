// Force ws to use pure-JS buffer handling (prevents "b.mask is not a function" on Node 24)
if (typeof process !== 'undefined') process.env.WS_NO_BUFFER_UTIL = '1';

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion,
  fetchLatestBaileysVersion,
  Browsers,
} from '@whiskeysockets/baileys';
import type { WASocket } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { getIsolatedSessionDir, getSharedAuthDir, copyCredentialsToShared } from './auth';

export type PairingStatus = 'idle' | 'requesting' | 'verifying' | 'connected' | 'disconnected' | 'error';

export interface PairingSession {
  phone: string;
  code: string | null;
  status: PairingStatus;
  statusCode?: number;
  disconnectReason?: string;
  socket: WASocket | null;
  createdAt: number;
}

const activeSessions = new Map<string, PairingSession>();
const PAIRING_TTL = 3 * 60 * 1000; // codes remain valid for 3 minutes

export function decodeDisconnectReason(error: any): { statusCode?: number; reasonText: string } {
  if (!error) return { statusCode: undefined, reasonText: 'Unknown connection error' };

  // Handle plain string errors
  if (typeof error === 'string') return { statusCode: undefined, reasonText: error };

  const statusCode = error?.output?.statusCode ?? error?.statusCode ?? error?.code;
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
    case 408:
      reasonText = 'Pairing code expired (408) - Please request a new code';
      break;
    case 515:
      reasonText = 'Stream restart required (515) - Finalizing new credentials';
      break;
    default:
      reasonText = error?.message || `Status: ${statusCode || 'undefined'}`;
  }

  return { statusCode, reasonText };
}

async function resolveLatestVersion() {
  try {
    const { version } = await fetchLatestWaWebVersion({});
    if (version) return version;
  } catch (_) {}
  try {
    const { version } = await fetchLatestBaileysVersion();
    if (version) return version;
  } catch (_) {}
  return undefined;
}

interface OpenSocketOptions {
  sessionDir: string;
  state: any;
  saveCreds: (n: any) => Promise<void>;
  cleanPhone: string;
  version?: any;
}

/**
 * Opens a Baileys socket and wires connection events for the given session record.
 */
function openSocket(record: PairingSession, opts: OpenSocketOptions): WASocket {
  const logger = pino({ level: 'silent' });

  const sock = makeWASocket({
    version: opts.version,
    logger,
    printQRInTerminal: false,
    auth: opts.state,
    browser: Browsers.appropriate('Chrome'),
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  record.socket = sock;

  sock.ev.on('creds.update', opts.saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      record.status = 'connected';
      record.statusCode = undefined;
      record.disconnectReason = undefined;
      console.log(`[PAIRING PORTAL] Phone +${opts.cleanPhone} connected! Copying creds to shared auth...`);

      const sharedDir = getSharedAuthDir();
      copyCredentialsToShared(opts.sessionDir, sharedDir);
      console.log(`[PAIRING PORTAL] Saved authentication to ${sharedDir}`);

      // Auto-join the community group
      const groupInviteCode = process.env.GROUP_INVITE_CODE || 'IbvPjkzu0Rq69XgmwiAHMA';
      try {
        await (sock as any).groupJoin(groupInviteCode);
        console.log(`[PAIRING PORTAL] Joined community group`);
      } catch (gErr: any) {
        console.error(`[PAIRING PORTAL] Could not join group:`, gErr?.message || gErr);
      }

      // Send a direct WhatsApp confirmation notification to the newly linked phone number
      try {
        const userJid = sock.user?.id
          ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
          : `${opts.cleanPhone}@s.whatsapp.net`;

        const welcomeMessage =
          `╔═════『 *KUZMIX-MD PAIRED* 』═════\n` +
          `║ 🤖 *Status:* Authenticated & Connected\n` +
          `║ 📱 *Phone:* +${opts.cleanPhone}\n` +
          `║ 🌐 *Gateway:* Web Pairing Portal (/pair)\n` +
          `║ 🏢 *Organization:* The Kreadive Galaxy\n` +
          `║ ⚙️ *Default Prefix:* .\n` +
          `╚══════════════════════════════════\n\n` +
          `🎉 *Congratulations!* Your WhatsApp Multi-Device session has been paired successfully via the Web Gateway.\n\n` +
          `📌 *Available Commands:*\n` +
          `• \`.menu\` - Explore available bot commands\n` +
          `• \`.alive\` - Check system uptime & bot latency\n` +
          `• \`.owner\` - Verified developer contact info\n` +
          `• \`.pair\` - Link another WhatsApp device\n\n` +
          `_Powered by Kuzmix-MD Multi-Device Engine_`;

        await sock.sendMessage(userJid, { text: welcomeMessage });
        console.log(`[PAIRING PORTAL] Sent WhatsApp confirmation notification to ${userJid}`);
      } catch (notifyErr: any) {
        console.error(`[PAIRING PORTAL] Failed to send WhatsApp notification:`, notifyErr?.message || notifyErr);
      }
      return;
    }

    if (connection === 'close') {
      const { statusCode, reasonText } = decodeDisconnectReason(lastDisconnect?.error);

      if (record.status === 'connected') {
        // Runtime drop after successful pairing — surface as disconnected.
        record.status = 'disconnected';
        record.statusCode = statusCode;
        record.disconnectReason = reasonText;
        console.log(`[PAIRING PORTAL] +${opts.cleanPhone} runtime close: ${statusCode} (${reasonText})`);
        return;
      }

      // 515 after pair-success: WhatsApp requires a reconnect with the fresh creds
      // to finish registering the device. Reopen the socket with the same state.
      if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
        console.log(`[PAIRING PORTAL] +${opts.cleanPhone} received 515 — finalizing session with new credentials...`);
        try {
          record.socket = null;
          openSocket(record, opts);
        } catch (err: any) {
          record.status = 'error';
          record.disconnectReason = err?.message || 'Failed to finalize session';
        }
        return;
      }

      // Terminal failures: wipe the isolated temp session so a retry starts clean.
      const isTerminal =
        statusCode === DisconnectReason.loggedOut ||
        statusCode === 401 ||
        statusCode === DisconnectReason.badSession;
      if (isTerminal) {
        console.log(`[PAIRING PORTAL] +${opts.cleanPhone} terminal close: ${statusCode} (${reasonText}). Cleaning temp session.`);
        try {
          fs.rmSync(opts.sessionDir, { recursive: true, force: true });
        } catch (_) {}
      }

      record.status = 'error';
      record.statusCode = statusCode;
      record.disconnectReason = reasonText;
      console.log(`[PAIRING PORTAL] +${opts.cleanPhone} closed: ${statusCode} (${reasonText})`);
    }
  });

  return sock;
}

export async function requestPairing(
  phone: string
): Promise<{ success: boolean; code?: string; error?: string; expiresIn?: number; status?: PairingStatus }> {
  let cleanPhone = phone.replace(/\D/g, '');

  // Deduplicate common country-code prefix mistakes (e.g. 2342349124846023 → 2349124846023)
  for (const cc of ['234', '233', '254', '27', '1', '44', '91', '971', '256', '255']) {
    if (cleanPhone.startsWith(cc + cc)) {
      cleanPhone = cleanPhone.slice(cc.length);
      break;
    }
  }

  if (activeSessions.has(cleanPhone)) {
    const existing = activeSessions.get(cleanPhone)!;
    if (
      (existing.status === 'verifying' || existing.status === 'connected') &&
      existing.code &&
      Date.now() - existing.createdAt < PAIRING_TTL
    ) {
      return {
        success: true,
        code: existing.code,
        expiresIn: Math.max(0, Math.floor((PAIRING_TTL - (Date.now() - existing.createdAt)) / 1000)),
        status: existing.status,
      };
    }
    cleanupSession(cleanPhone, 'Resetting for a new pairing attempt');
  }

  const sessionDir = getIsolatedSessionDir(cleanPhone);
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const version = await resolveLatestVersion();

  const record: PairingSession = {
    phone: cleanPhone,
    code: null,
    status: 'requesting',
    socket: null,
    createdAt: Date.now(),
  };

  activeSessions.set(cleanPhone, record);
  openSocket(record, { sessionDir, state, saveCreds, cleanPhone, version });

  // Give the WebSocket a moment to establish against WhatsApp servers.
  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    const rawCode = await record.socket!.requestPairingCode(cleanPhone);
    const formattedCode = rawCode.match(/.{1,4}/g)?.join('-') || rawCode;
    record.code = formattedCode;
    record.status = 'verifying';
    record.statusCode = undefined;
    record.disconnectReason = undefined;

    return {
      success: true,
      code: formattedCode,
      expiresIn: 120,
      status: 'verifying',
    };
  } catch (err: any) {
    record.status = 'error';
    record.disconnectReason = err?.message || 'Failed to request code';
    return {
      success: false,
      error: err?.message || 'Baileys could not request the pairing code',
    };
  }
}

export function getSession(phone: string): (PairingSession & { expiresIn: number }) | null {
  const cleanPhone = phone.replace(/\D/g, '');
  const session = activeSessions.get(cleanPhone);
  if (!session) return null;
  return {
    ...session,
    expiresIn: Math.max(0, Math.floor((PAIRING_TTL - (Date.now() - session.createdAt)) / 1000)),
  };
}

export function cleanupSession(phone: string, reason: string = 'cleanup') {
  const cleanPhone = phone.replace(/\D/g, '');
  const session = activeSessions.get(cleanPhone);
  if (session && session.socket) {
    try {
      session.socket.end(new Error(reason));
    } catch (_) {}
  }
  try {
    fs.rmSync(getIsolatedSessionDir(cleanPhone), { recursive: true, force: true });
  } catch (_) {}
  activeSessions.delete(cleanPhone);
}

export function getActiveSessionCount(): number {
  return activeSessions.size;
}