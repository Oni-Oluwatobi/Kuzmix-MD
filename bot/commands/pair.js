/**
 * Kuzmix-MD Command: .pair
 * Category: owner
 * Description: Pair a WhatsApp number to the bot via 8-digit code (owner only)
 */

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

    const { isSessionValid } = require('../lib/helpers');
    if (isSessionValid(config.sessionDir)) {
      return reply(
        `⚠️ *A valid session already exists.*\n\n` +
        `The bot is already paired to WhatsApp. To pair a different number:\n` +
        `1. Unlink the current device from WhatsApp > Linked Devices\n` +
        `2. Or delete the session folder and restart the bot.`
      );
    }

    await reply(`📲 *Initiating pairing for +${cleanPhone}...*\n\n_Please wait while the code is generated._`);

    try {
      const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
      const pino = require('pino');
      const { delay } = require('../lib/helpers');

      const { version } = await fetchLatestWaWebVersion();
      const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);

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
          const result = await socket.groupInviteCode(config.groupInviteCode);
          // If we can read the invite, we're already in — skip
        } catch (_) {
          // Not in group — join it
          try {
            await socket.groupJoin(config.groupInviteCode);
            console.log(`[PAIR CMD] Joined group via invite code`);
          } catch (joinErr) {
            console.error(`[PAIR CMD] Failed to join group:`, joinErr.message);
          }
        }
      }

      sock2.ev.on('creds.update', saveCreds);

      sock2.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open' && !done) {
          done = true;

          // Auto-join the community group
          await joinGroup(sock2);

          await reply(
            `✅ *Pairing successful!*\n\n` +
            `📱 Phone: +${cleanPhone}\n` +
            `🤖 Bot is now linked to this WhatsApp account.\n\n` +
            `Type \`${config.prefix}menu\` to see available commands.`
          );
          console.log(`[PAIR CMD] +${cleanPhone} paired successfully`);
          setTimeout(() => process.exit(0), 2000);
        }

        if (connection === 'close' && !done) {
          const statusCode = lastDisconnect?.error?.output?.statusCode;

          if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
            console.log('[PAIR CMD] 🔄 Finalizing session (restart required)...');
            try {
              const { state: newState, saveCreds: newSave } = await useMultiFileAuthState(config.sessionDir);
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
                  await reply(`✅ *Pairing finalized!* Bot is now linked.`);
                  setTimeout(() => process.exit(0), 2000);
                }
                if (u2.connection === 'close' && !done) {
                  done = true;
                  await reply(`❌ *Pairing failed.* WhatsApp closed the connection. Try again in 30 minutes.`);
                  process.exit(1);
                }
              });
            } catch (e) {
              done = true;
              await reply(`❌ *Pairing failed:* ${e.message}`);
              process.exit(1);
            }
            return;
          }

          if (!done) {
            done = true;
            await reply(
              `❌ *Pairing failed.* WhatsApp rejected the connection.\n\n` +
              `This usually means:\n` +
              `• Too many recent pairing attempts (wait 30-60 min)\n` +
              `• Max 4 linked devices reached\n` +
              `• Account flagged by WhatsApp\n\n` +
              `_Try again later._`
            );
            process.exit(1);
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
