const fs = require('fs');
const path = require('path');
const { delay, cleanPhoneNumber } = require('../lib/helpers');

// Helper to get silent pino logger or fallback dummy logger
function getSilentLogger() {
  try {
    const pino = require('pino');
    return pino({ level: 'silent' });
  } catch (_) {
    const noop = () => {};
    return {
      level: 'silent',
      child: () => ({ info: noop, error: noop, warn: noop, debug: noop, trace: noop }),
      info: noop,
      error: noop,
      warn: noop,
      debug: noop,
      trace: noop,
    };
  }
}

// Keep track of active in-flight pairing sockets to prevent duplicates and resource leaks
const activePairingSockets = new Map();

module.exports = {
  name: 'pair',
  aliases: ['pairing', 'paircode', 'link', 'linkdevice'],
  category: 'System',
  description: 'Requests an authentic 8-digit WhatsApp pairing code for device linking',
  usage: '.pair [phoneNumber]',
  example: '.pair 2348143186133',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, senderNumber, config } = ctx;

    // Lazy load Baileys
    let makeWASocket, useMultiFileAuthState;
    try {
      const baileys = require('@whiskeysockets/baileys');
      makeWASocket = baileys.default || baileys;
      useMultiFileAuthState = baileys.useMultiFileAuthState;
    } catch (importErr) {
      console.error('[PAIR COMMAND] Baileys library not found:', importErr.message);
      return reply('⚠️ *Baileys library is not installed in the bot runtime.* Run `npm install` inside the `bot/` folder.');
    }

    // Determine target phone number: from args, or fallback to sender's own number
    let rawInput = args.join('').trim();
    let targetPhone = '';

    if (rawInput) {
      targetPhone = cleanPhoneNumber(rawInput);
    } else if (senderNumber && senderNumber.length >= 7) {
      targetPhone = cleanPhoneNumber(senderNumber);
    }

    // Validate phone number format (international standard: 7 to 15 digits)
    if (!targetPhone || targetPhone.length < 7 || targetPhone.length > 15) {
      return reply(
        `❌ *Invalid Phone Number*\n\n` +
        `Please specify a valid phone number including country code:\n` +
        `👉 \`${config.prefix}pair 2348143186133\`\n\n` +
        `• Do not include \`+\`, spaces, or hyphens.\n` +
        `• Example: \`${config.prefix}pair 2349124846023\`\n` +
        `• Or type \`${config.prefix}pair\` in private chat to use your own number.`
      );
    }

    // Clean up any stale active socket for this phone number
    if (activePairingSockets.has(targetPhone)) {
      try {
        const oldSock = activePairingSockets.get(targetPhone);
        oldSock.end(new Error('Resetting for new pairing attempt'));
      } catch (_) {}
      activePairingSockets.delete(targetPhone);
    }

    await reply(
      `⏳ *Requesting authentic WhatsApp pairing code for +${targetPhone}...*\n` +
      `_Connecting to Baileys Multi-Device gateway..._`
    );

    const tempDir = path.join(process.cwd(), 'temp_sessions', `pair_${targetPhone}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let tempSock = null;
    let cleanupTimer = null;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(tempDir);
      const logger = getSilentLogger();

      tempSock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: ['Kuzmix-MD', 'Chrome', '120.0.0'],
        syncFullHistory: false,
      });

      activePairingSockets.set(targetPhone, tempSock);

      tempSock.ev.on('creds.update', saveCreds);

      // Listen for connection events
      tempSock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
          console.log(`[PAIR COMMAND] Device +${targetPhone} linked successfully!`);
          try {
            await reply(`🎉 *WhatsApp account (+${targetPhone}) has been successfully linked and authenticated!*`);
          } catch (_) {}

          // Cleanup active socket after linking
          if (cleanupTimer) clearTimeout(cleanupTimer);
          activePairingSockets.delete(targetPhone);
          try {
            tempSock.end(new Error('Paired successfully'));
          } catch (_) {}
        }
      });

      // Auto-cleanup timer (150 seconds / 2.5 minutes) to avoid socket leaks
      cleanupTimer = setTimeout(() => {
        if (activePairingSockets.has(targetPhone)) {
          console.log(`[PAIR COMMAND] Pairing session for +${targetPhone} expired.`);
          activePairingSockets.delete(targetPhone);
          try {
            tempSock.end(new Error('Pairing session timed out'));
          } catch (_) {}
        }
      }, 150000);

      // Wait 3 seconds for Baileys handshake with WhatsApp servers
      await delay(3000);

      // Request official 8-digit pairing code from WhatsApp Multi-Device servers
      const rawCode = await tempSock.requestPairingCode(targetPhone);
      const formattedCode = rawCode.match(/.{1,4}/g)?.join('-') || rawCode;

      const responseMessage =
        `╔═════『 *WHATSAPP PAIRING CODE* 』═════\n` +
        `║ 📱 *Phone Number:* +${targetPhone}\n` +
        `║ 🔑 *Pairing Code:* *${formattedCode}*\n` +
        `╚════════════════════════════════════════\n\n` +
        `*📋 How to Link:* \n` +
        `1. Open WhatsApp on phone *+${targetPhone}*\n` +
        `2. Tap *Settings* (or ⋮) > *Linked Devices*\n` +
        `3. Tap *Link a Device*\n` +
        `4. Tap *Link with phone number instead*\n` +
        `5. Enter code: *${formattedCode}*\n\n` +
        `⏱️ *Expires in:* 2 minutes\n` +
        `🌐 *Web Portal:* \`/pair\` (Pairing Gateway)\n` +
        `_${config.watermark}_`;

      await reply(responseMessage);
    } catch (err) {
      console.error(`[PAIR COMMAND] Error requesting code for +${targetPhone}:`, err);
      if (cleanupTimer) clearTimeout(cleanupTimer);
      activePairingSockets.delete(targetPhone);
      if (tempSock) {
        try {
          tempSock.end(new Error('Pairing request failed'));
        } catch (_) {}
      }

      await reply(
        `❌ *Failed to generate pairing code for +${targetPhone}*\n\n` +
        `*Details:* ${err.message || 'WhatsApp rejected the pairing request'}\n\n` +
        `• Make sure the phone number includes the correct country code.\n` +
        `• If you recently requested codes, WhatsApp may temporarily rate-limit you for 60 seconds.\n` +
        `• You can also link via the Web Gateway at \`/pair\`.`
      );
    }
  },
};
