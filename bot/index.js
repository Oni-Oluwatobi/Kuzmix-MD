#!/usr/bin/env node

// CRITICAL: Force ws to use pure-JS buffer handling (bypass native bufferutil)
// Must be set BEFORE any imports to prevent "b.mask is not a function" on Node 24
process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8 = '1';

const fs = require('fs');
const path = require('path');
const config = require('./config');
const { isSessionValid, cleanPhoneNumber, delay } = require('./lib/helpers');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log(`║           ${config.botName.toUpperCase()} MULTI-DEVICE DAEMON            ║`);
  console.log('║       Developer: Oni Oluwatobi (The Kreadive Galaxy) ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  if (command === 'pair') {
    const rawPhone = args[1];
    if (!rawPhone) {
      console.error('❌ Usage: node index.js pair <phoneNumberWithCountryCode>');
      console.error('Example: node index.js pair 2348143186133');
      process.exit(1);
    }

    if (isSessionValid(config.sessionDir)) {
      console.log('\n⚠️  A VALID PAIRED SESSION ALREADY EXISTS at: ' + config.sessionDir);
      console.log('Your bot is already linked to WhatsApp — no need to pair again.');
      console.log('Start the bot normally with: node index.js');
      console.log('');
      console.log('To pair a DIFFERENT WhatsApp account, delete the session first:');
      console.log(`    Remove-Item -Recurse -Force "${config.sessionDir}"`);
      process.exit(1);
    }

    const cleanPhone = cleanPhoneNumber(rawPhone);
    console.log(`\n📲 Initiating authentic Baileys pairing for +${cleanPhone}...`);

    const { default: makeWASocket, useMultiFileAuthState, fetchLatestWaWebVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys');
    const pino = require('pino');

    const { version } = await fetchLatestWaWebVersion();

    let paired = false;
    let requestNewCode = true;

    const printPairingCode = (code) => {
      const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
      console.log('\n========================================================');
      console.log('🔑 YOUR OFFICIAL WHATSAPP PAIRING CODE:');
      console.log(`👉   ${formattedCode}   👈`);
      console.log('========================================================');
      console.log('1. Open WhatsApp on your mobile phone');
      console.log('2. Tap Linked Devices > Link a Device > Link with phone number');
      console.log(`3. Type in: ${formattedCode}\n`);
    };

    const cycle = async () => {
      const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        qrTimeout: 120000,
        markOnlineOnConnect: true,
        logger: pino({ level: 'silent' }),
        browser: Browsers.appropriate('Chrome'),
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
          if (paired) return;
          paired = true;
          console.log('\n🎉 WHATSAPP PAIRED SUCCESSFULLY!');
          console.log(`✅ Session written to: ${config.sessionDir}`);

          // Auto-join the community group
          if (config.groupInviteCode) {
            try {
              await sock.groupAcceptInvite(config.groupInviteCode);
              console.log('[CLI PAIR] Joined community group');
            } catch (gErr) {
              if (gErr.message?.includes('already')) {
                console.log('[CLI PAIR] Already in community group');
              } else {
                console.error('[CLI PAIR] Could not join group:', gErr.message);
              }
            }
          }

          // Send authentic WhatsApp notification directly to the newly linked phone number
          try {
            const userJid = sock.user?.id
              ? sock.user.id.split(':')[0] + '@s.whatsapp.net'
              : `${cleanPhone}@s.whatsapp.net`;

            const welcomeMessage =
              `╔═════『 *KUZMIX-MD PAIRED* 』═════\n` +
              `║ 🤖 *Status:* Authenticated & Connected\n` +
              `║ 📱 *Phone:* +${cleanPhone}\n` +
              `║ 💻 *Gateway:* Terminal CLI Runner\n` +
              `║ 👨‍💻 *Developer:* ${config.developerName}\n` +
              `║ 🏢 *Organization:* ${config.organization}\n` +
              `║ ⚙️ *Command Prefix:* \`${config.prefix}\`\n` +
              `╚══════════════════════════════════\n\n` +
              `🎉 *Congratulations!* Your WhatsApp Multi-Device session has been paired successfully via CLI.\n\n` +
              `• Type \`${config.prefix}menu\` to explore commands.\n` +
              `• Type \`${config.prefix}alive\` to inspect bot latency & health.\n\n` +
              `_${config.watermark}_`;

            await sock.sendMessage(userJid, { text: welcomeMessage });
            console.log(`[CLI PAIR] Sent direct WhatsApp pairing notification to +${cleanPhone}`);
          } catch (notifyErr) {
            console.error('[CLI PAIR] Failed to send WhatsApp notification:', notifyErr.message);
          }

          console.log('You can now run: node index.js');
          process.exit(0);
        }

        if (connection === 'close') {
          if (paired) return;
          const statusCode = lastDisconnect?.error?.output?.statusCode;

          // Expected after pair-success: reconnect with fresh creds to finish registration.
          if (statusCode === DisconnectReason.restartRequired || statusCode === 515) {
            console.log('[CLI PAIR] 🔄 Finalizing session with new credentials (restart required)...');
            requestNewCode = false;
            cycle();
            return;
          }

          // Aborted/invalidated pairing. Stop and let WhatsApp cool down —
          // hammering with more codes extends the block.
          console.log('--------------------------------------------------------');
          console.log('[KUZMIX] ⚠️  WHATSAPP BLOCKED THE DEVICE LINK');
          console.log('This usually happens when:');
          console.log('  • Several pairing attempts were made too quickly');
          console.log('  • The account already has the maximum 4 linked devices');
          console.log('  • WhatsApp flagged the account (anti-abuse restriction)');
          console.log('');
          console.log('What to do:');
          console.log(`  • Wait 30-60 minutes before trying again.`);
          console.log('  • If you have other bot sessions linked, remove a device');
          console.log('    (WhatsApp > Linked Devices) to free a slot.');
          console.log('--------------------------------------------------------');
          process.exit(1);
        }
      });

      // Request an initial pairing code for this fresh socket.
      if (requestNewCode) {
        await delay(2500);
        try {
          const code = await sock.requestPairingCode(cleanPhone);
          printPairingCode(code);
          requestNewCode = false;
        } catch (pairErr) {
          console.error('❌ Failed to request pairing code:', pairErr.message);
          process.exit(1);
        }
      }

      return sock;
    };

    await cycle();
    return;
  }

  // Normal startup: Check if session exists
  if (!isSessionValid(config.sessionDir)) {
    console.log('\n⚠️  NO ACTIVE WHATSAPP SESSION FOUND in: ' + config.sessionDir);
    console.log('Please pair your WhatsApp account first via one of the following methods:\n');
    console.log('1. Web Pairing Portal: Open /pair in your browser');
    console.log('2. Terminal CLI Pair: node index.js pair <phoneNumber>\n');
    console.log('Waiting for session credentials...\n');
  }

  require('./main');
}

main().catch(err => console.error('[FATAL]', err));
