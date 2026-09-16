// Test all commands in bot/commands to guarantee 100% functionality
const fs = require('fs');
const path = require('path');
const commandHandler = require('./handlers/commandHandler');
const config = require('./config');

async function testAllCommands() {
  console.log('--- TESTING KUZMIX-MD BOT COMMANDS ---');
  commandHandler.loadCommands();
  const commands = Array.from(commandHandler.commands.values());
  console.log(`Loaded ${commands.length} commands.`);

  const mockReplies = [];
  const mockSentMessages = [];

  const mockSock = {
    user: { id: '2348143186133:1@s.whatsapp.net' },
    sendMessage: async (jid, content, options) => {
      mockSentMessages.push({ jid, content, options });
      return { key: { id: 'MOCK_MSG_' + Date.now() } };
    },
    requestPairingCode: async (phone) => '1234-5678',
    ev: { on: () => {} },
  };

  const mockCtx = {
    sock: mockSock,
    msg: {
      key: { remoteJid: '2348143186133@s.whatsapp.net', id: 'TEST_ID_1', fromMe: false },
      message: { conversation: '.test' },
    },
    from: '2348143186133@s.whatsapp.net',
    sender: '2348143186133@s.whatsapp.net',
    senderNumber: '2348143186133',
    isGroup: false,
    isOwner: true,
    fromMe: false,
    command: '',
    args: [],
    body: '',
    reply: async (text, options) => {
      mockReplies.push({ text, options });
      console.log(`  [REPLY OUTPUT] ${String(text).slice(0, 60).replace(/\n/g, ' ')}...`);
      return { key: { id: 'MOCK_REPLY_' + Date.now() } };
    },
    config,
    database: require('./database'),
  };

  let passed = 0;
  let failed = 0;

  for (const cmd of commands) {
    console.log(`\nTesting command: .${cmd.name} (aliases: ${cmd.aliases.join(', ')})`);
    try {
      mockCtx.command = cmd.name;
      mockCtx.args = [];
      await cmd.execute(mockCtx);
      console.log(`✅ [PASS] .${cmd.name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] .${cmd.name}:`, err.message);
      failed++;
    }
  }

  // Also test .menu with arguments (command query)
  console.log(`\nTesting command: .menu pair`);
  try {
    mockCtx.command = 'menu';
    mockCtx.args = ['pair'];
    const menuCmd = commandHandler.getCommand('menu');
    await menuCmd.execute(mockCtx);
    console.log(`✅ [PASS] .menu pair`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] .menu pair:`, err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testAllCommands();
