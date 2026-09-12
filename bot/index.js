#!/usr/bin/env node

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

    const cleanPhone = cleanPhoneNumber(rawPhone);
    console.log(`\n📲 Initiating authentic Baileys pairing for +${cleanPhone}...`);

    const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
    const pino = require('pino');

    const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Kuzmix-MD', 'Chrome', '120.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection } = update;
      if (connection === 'open') {
        console.log('\n🎉 WHATSAPP PAIRED SUCCESSFULLY!');
        console.log(`✅ Session written to: ${config.sessionDir}`);
        console.log('You can now run: node index.js');
        process.exit(0);
      }
    });

    await delay(3000);
    try {
      const code = await sock.requestPairingCode(cleanPhone);
      const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
      console.log('\n========================================================');
      console.log(`🔑 YOUR OFFICIAL WHATSAPP PAIRING CODE:`);
      console.log(`👉   ${formattedCode}   👈`);
      console.log('========================================================');
      console.log('1. Open WhatsApp on your mobile phone');
      console.log('2. Tap Linked Devices > Link a Device > Link with phone number');
      console.log(`3. Type in: ${formattedCode}\n`);
    } catch (pairErr) {
      console.error('❌ Failed to request pairing code:', pairErr.message);
      process.exit(1);
    }
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
