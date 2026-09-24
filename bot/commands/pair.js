/**
 * Kuzmix-MD Command: .pair
 * Category: owner
 * Description: Pair a WhatsApp number to the bot via 8-digit code (owner only)
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'pair',
  aliases: ['linkdevice', 'ld'],
  category: 'owner',
  description: 'Pair a WhatsApp number to the bot via 8-digit code',
  usage: '.pair 2348143186133',
  example: '.pair 2348143186133',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config, isOwner } = ctx;

    if (!isOwner) {
      return reply(`🔒 *Owner Only*\n\nThis command can only be used by the bot owner.`);
    }

    const rawPhone = args.join(' ').trim();
    if (!rawPhone) {
      return reply(
        `📱 *WhatsApp Pairing (.pair)*\n\n` +
        `Usage: \`.pair <phoneNumber>\`\n` +
        `Example: \`.pair 2348143186133\`\n\n` +
        `_Provide the full international number with country code._`
      );
    }

    const cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      return reply(`❌ *Invalid phone number.* Provide a full international number (e.g. 2348143186133).`);
    }

    const sessionDir = path.join(config.sessionsRoot, cleanPhone);

    // Check if this number already has a session
    const credsPath = path.join(sessionDir, 'creds.json');
    if (fs.existsSync(credsPath)) {
      return reply(
        `⚠️ *+${cleanPhone} is already paired.*\n\n` +
        `To re-pair, first unlink from WhatsApp > Linked Devices.`
      );
    }

    // Ensure session directory exists
    fs.mkdirSync(sessionDir, { recursive: true });

    await reply(`📲 *Initiating pairing for +${cleanPhone}...*\n\n_Please wait while the code is generated._`);

    try {
      const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
      const pino = require('pino');
      const { delay } = require('../lib/helpers');

      const { version } = await fetchLatestWaWebVersion();
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

      const sock2 = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.appropriate('Chrome'),
        syncFullHistory: false,
        markOnlineOnConnect: true,
      });

      let done = false;

      async function joinGroup(socket) {
        if (!config.groupInviteCode) return;
        try {
          await socket.groupAcceptInvite(config.groupInviteCode);
          console.log(`[PAIR CMD] Joined community group`);
        } catch (joinErr) {
          if (joinErr.message?.includes('already')) {
            console.log(`[PAIR CMD] Already in community group`);
          } else {
            console.error(`[PAIR CMD] Failed to join group:`, joinErr.message);
          }
        }
      }

      sock2.ev.on('creds.update', saveCreds);

      sock2.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open' && !done) {
          done = true;

          // Join the group BEFORE closing the socket (an ended socket cannot join)
          await joinGroup(sock2);

          // Close pairing socket — bot.js will load this session
          try { sock2.end(undefined); } catch (_) {}

          // Start the bot for this user dynamically
          try {
            const bot = require('../bot');
            await bot.startSession(cleanPhone, sessionDir);
            console.log(`[PAIR CMD] +${cleanPhone} bot started dynamically`);
          } catch (startErr) {
            console.error(`[PAIR CMD] Dynamic start failed, session saved:`, startErr.message);
          }

          await reply(
            `✅ *Pairing successful!*\n\n` +
            `📱 Phone: +${cleanPhone}\n` +
            `🤖 Bot is now linked and ONLINE.\n\n` +
            `Type \`${config.prefix}menu\` to see available commands.`
          );
          console.log(`[PAIR CMD] +${cleanPhone} paired successfully`);
        }

        if (connection === 'close' && !done) {
          const statusCode = lastDisconnect?.error?.output?.statusCode;

          if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
            console.log('[PAIR CMD] 🔄 Finalizing session (restart required)...');
            try {
              const { state: newState, saveCreds: newSave } = await useMultiFileAuthState(sessionDir);
              const sock3 = makeWASocket({
                version,
                auth: newState,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.appropriate('Chrome'),
                syncFullHistory: false,
              });
              sock3.ev.on('creds.update', newSave);
              sock3.ev.on('connection.update', async (u2) => {
                if (u2.connection === 'open' && !done) {
                  done = true;
                  await joinGroup(sock3);
                  try { sock3.end(undefined); } catch (_) {}
                  try {
                    const bot = require('../bot');
                    await bot.startSession(cleanPhone, sessionDir);
                  } catch (_) {}
                  await reply(`✅ *Pairing finalized!* +${cleanPhone} bot is now ONLINE.`);
                }
                if (u2.connection === 'close' && !done) {
                  done = true;
                  await reply(`❌ *Pairing failed.* WhatsApp closed the connection. Try again in 30 minutes.`);
                }
              });
            } catch (e) {
              done = true;
              await reply(`❌ *Pairing failed:* ${e.message}`);
            }
            return;
          }

          if (!done) {
            done = true;
            // Clean up failed session
            try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch (_) {}
            await reply(
              `❌ *Pairing failed.* WhatsApp rejected the connection.\n\n` +
              `This usually means:\n` +
              `• Too many recent pairing attempts (wait 30-60 min)\n` +
              `• Max 4 linked devices reached\n` +
              `• Account flagged by WhatsApp\n\n` +
              `_Try again later._`
            );
          }
        }
      });

      await delay(2500);
      const code = await sock2.requestPairingCode(cleanPhone);
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;

      await reply(
        `🔑 *Your WhatsApp Pairing Code:*\n\n` +
        `\`\`\`\n${formatted}\n\`\`\`\n\n` +
        `*Steps:*\n` +
        `1. Open WhatsApp on your phone\n` +
        `2. Go to *Linked Devices* > *Link a Device*\n` +
        `3. Tap *Link with phone number instead*\n` +
        `4. Enter: \`${formatted}\`\n\n` +
        `_Code expires in 2 minutes._`
      );
    } catch (err) {
      console.error('[PAIR CMD ERROR]', err.message);
      await reply(`❌ *Pairing error:* ${err.message}\n\n_Try again in a few minutes._`);
    }
  }
};
