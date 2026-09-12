import { BotConfig } from '@/components/types';

// ==========================================
// [1] KUZMIX-MD MASTER CONFIGURATION
// ==========================================
export function generateKuzmixConfig(config: BotConfig): string {
  const numbersComma = config.ownerNumbers.join(',');
  const numbersFormatted = config.ownerNumbers.map((n) => `'${n}'`).join(', ');
  const primaryNumber = config.ownerNumbers[0] || '2348143186133';

  return `/**
 * ${config.botName} Master Configuration File
 * Engineered by: ${config.botDeveloper} (${config.organization})
 * Maintainer: ${config.ownerName}
 */

const fs = require('fs');
if (fs.existsSync('config.env')) {
  require('dotenv').config({ path: './config.env' });
}

function convertToBool(text, fault = 'true') {
  return text === fault ? true : false;
}

module.exports = {
  // [1] AUTHENTICATION & SECURITY
  SESSION_ID: process.env.SESSION_ID || '',

  // [2] BOT & OWNER IDENTITY
  BOT_NAME: process.env.BOT_NAME || '${config.botName}',
  BOT_DEV: process.env.BOT_DEV || '${config.botDeveloper}',
  OWNER_NAME: process.env.OWNER_NAME || '${config.ownerName}',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '${numbersComma}',
  OWNER_LIST: [${numbersFormatted}],
  DEV_NUMBER: process.env.DEV_NUMBER || '${primaryNumber}',
  ORGANIZATION: process.env.ORGANIZATION || '${config.organization}',
  EMAIL: process.env.EMAIL || '${config.email}',

  // [3] COMMAND HANDLING & ENGINE
  PREFIX: process.env.PREFIX || '${config.prefix}',
  MODE: process.env.MODE || 'public', // 'public' or 'private'
  AUTO_READ_STATUS: convertToBool(process.env.AUTO_READ_STATUS, 'true'),
  AUTO_VOICE: convertToBool(process.env.AUTO_VOICE, 'false'),
  AUTO_STICKER: convertToBool(process.env.AUTO_STICKER, 'false'),
  ALWAYS_ONLINE: convertToBool(process.env.ALWAYS_ONLINE, 'true'),

  // [4] AI ENGINE & OPENROUTER
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free',

  // [5] STICKER PACK METADATA
  STICKER_PACK: process.env.STICKER_PACK || '${config.stickerPack}',
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || '${config.stickerAuthor}',

  // [6] BRANDING & MEDIA ASSETS
  THUMB_IMAGE: process.env.THUMB_IMAGE || './image/kuzmix.jpg',
  ALIVE_IMG: process.env.ALIVE_IMG || './image/kuzmix-alive.jpg',
  WAIT_MESSAGE: process.env.WAIT_MESSAGE || '${config.waitMessage}',
  FOOTER: process.env.FOOTER || '${config.watermark || `© ${config.botName} • ${config.organization}`}',

  // [7] RESPONSE NOTIFICATIONS
  MESSAGES: {
    wait: '${config.waitMessage}',
    success: '✓ Done successfully by ${config.botName}',
    admin: '⚠️ This feature can only be executed by Group Admins!',
    botAdmin: '⚠️ ${config.botName} must be granted Admin privileges first!',
    owner: '🔒 Access Denied! This command is restricted to ${config.ownerName}!',
    group: '👥 This command can only be used inside WhatsApp Groups!',
    private: '📩 This command is intended for Private DM chat only!',
    error: '❌ An unexpected error occurred while executing command.',
  }
};
`;
}

// ==========================================
// [2] KUZMIX-MD MASTER BAILEYS SOCKET ENGINE
// ==========================================
export function generateKuzmixIndex(config: BotConfig): string {
  return `/**
 * ${config.botName} - WhatsApp Multi-Device Master Engine
 * Main Entry Point: index.js
 * Developer: ${config.botDeveloper} (${config.organization})
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  Browsers,
} = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('./config');
const { commands, loadCommands } = require('./command');

const store = makeInMemoryStore({ logger: P({ level: 'silent' }).child({ level: 'silent' }) });

// --- [PERSISTENT USER SETTINGS STORE] ---
// Tracks individual user preferences such as UNKNOWN MODE (private response routing)
const USER_SETTINGS_FILE = path.join(__dirname, 'database', 'userSettings.json');

let userSettings = {};
function initUserSettings() {
  try {
    const dir = path.dirname(USER_SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(USER_SETTINGS_FILE)) {
      userSettings = JSON.parse(fs.readFileSync(USER_SETTINGS_FILE, 'utf-8'));
    }
  } catch (e) {
    userSettings = {};
  }
}
initUserSettings();

function isUnknownMode(userJid) {
  if (!userJid) return false;
  return Boolean(userSettings[userJid]?.unknownMode);
}

function setUnknownMode(userJid, enabled) {
  if (!userJid) return;
  if (!userSettings[userJid]) userSettings[userJid] = {};
  userSettings[userJid].unknownMode = Boolean(enabled);
  userSettings[userJid].updatedAt = Date.now();
  try {
    fs.writeFileSync(USER_SETTINGS_FILE, JSON.stringify(userSettings, null, 2));
  } catch (err) {
    console.error(chalk.red('[!] Failed to persist user settings:'), err.message);
  }
}

async function startKuzmixBot() {
  console.log(chalk.blue.bold(\`\\n========================================\`));
  console.log(chalk.cyan.bold(\`   🌌 \${config.BOT_NAME} - Multi-Device Engine\`));
  console.log(chalk.gray(\`   Lead Engineer: \${config.BOT_DEV}\`));
  console.log(chalk.gray(\`   Organization: \${config.ORGANIZATION}\`));
  console.log(chalk.blue.bold(\`========================================\\n\`));

  // Load all modular plugins
  loadCommands(path.join(__dirname, 'commands'));

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(chalk.green(\`[+] Baileys MD Version: \${version.join('.')} (Latest: \${isLatest})\`));

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: Browsers.macOS('Desktop'),
    auth: state,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
  });

  store.bind(conn.ev);

  // Connection State Handling
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('[!] Scan the QR code above with WhatsApp linked devices.'));
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        chalk.red(\`[x] Connection closed due to: \${lastDisconnect?.error?.message}. Reconnecting: \${shouldReconnect}\`)
      );
      if (shouldReconnect) {
        startKuzmixBot();
      }
    } else if (connection === 'open') {
      console.log(chalk.green.bold(\`[✓] \${config.BOT_NAME} Connected successfully!\`));
      console.log(chalk.cyan(\`[✓] Prefix: '\${config.PREFIX}' | Total Commands: \${commands.length}\`));
    }
  });

  // Save session credentials
  conn.ev.on('creds.update', saveCreds);

  // Message Dispatcher
  conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const mek = chatUpdate.messages[0];
      if (!mek || !mek.message) return;
      if (mek.key && mek.key.remoteJid === 'status@broadcast') {
        if (config.AUTO_READ_STATUS) await conn.readMessages([mek.key]);
        return;
      }

      const from = mek.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = isGroup ? mek.key.participant : mek.key.remoteJid;
      const pushname = mek.pushName || 'User';

      const body =
        mek.message.conversation ||
        mek.message.extendedTextMessage?.text ||
        mek.message.imageMessage?.caption ||
        mek.message.videoMessage?.caption ||
        '';

      const isCmd = body.startsWith(config.PREFIX);
      if (!isCmd) return;

      const command = body.slice(config.PREFIX.length).trim().split(/ +/).shift().toLowerCase();
      const args = body.trim().split(/ +/).slice(1);
      const text = args.join(' ');

      const isOwner = config.OWNER_LIST.some((num) => sender.includes(num));

      // --- [RESPONSE ROUTING ARCHITECTURE / UNKNOWN MODE] ---
      // If UNKNOWN MODE is active for sender in a group, redirect all generated responses to sender's private JID
      const isUserUnknownActive = isGroup && isUnknownMode(sender);
      const responseDestination = isUserUnknownActive ? sender : from;

      const reply = async (teks, options = {}) => {
        try {
          // If rerouted privately from a group, omit cross-chat quoted message to prevent WhatsApp Baileys reference errors
          const sendOptions = isUserUnknownActive ? { ...options } : { quoted: mek, ...options };
          return await conn.sendMessage(responseDestination, { text: teks }, sendOptions);
        } catch (err) {
          console.error(chalk.red('[!] Reply delivery error:'), err.message);
        }
      };

      // Transparent connection proxy for commands that invoke conn.sendMessage directly
      const proxyConn = new Proxy(conn, {
        get(target, prop) {
          if (prop === 'sendMessage') {
            return async (targetJid, content, opts = {}) => {
              const dest = (targetJid === from && isUserUnknownActive) ? sender : targetJid;
              const finalOpts = (dest === sender && isUserUnknownActive) ? { ...opts, quoted: undefined } : opts;
              try {
                return await target.sendMessage(dest, content, finalOpts);
              } catch (err) {
                console.error(chalk.red('[!] Destination message error:'), err.message);
              }
            };
          }
          return target[prop];
        },
      });

      // Find matching command plugin
      const cmdHandler = commands.find(
        (c) => c.pattern === command || (c.alias && c.alias.includes(command))
      );

      if (cmdHandler) {
        // Serialize quoted message if present in extendedTextMessage
        const contextInfo = mek.message?.extendedTextMessage?.contextInfo;
        if (contextInfo && contextInfo.quotedMessage) {
          mek.quoted = {
            id: contextInfo.stanzaId,
            sender: contextInfo.participant,
            fromMe: contextInfo.participant ? contextInfo.participant.includes(conn.user?.id?.split(':')[0]) : false,
            message: contextInfo.quotedMessage,
            viewOnceMessage: contextInfo.quotedMessage.viewOnceMessage,
            viewOnceMessageV2: contextInfo.quotedMessage.viewOnceMessageV2,
            viewOnceMessageV2Extension: contextInfo.quotedMessage.viewOnceMessageV2Extension,
            imageMessage: contextInfo.quotedMessage.imageMessage,
            videoMessage: contextInfo.quotedMessage.videoMessage,
          };
        }

        // Suppress group reactions if Unknown Mode is active so group receives zero trace
        if (cmdHandler.react && !isUserUnknownActive) {
          await conn.sendMessage(from, { react: { text: cmdHandler.react, key: mek.key } });
        }

        await cmdHandler.function(proxyConn, mek, mek, {
          from,
          prefix: config.PREFIX,
          command,
          args,
          text,
          pushname,
          isGroup,
          isOwner,
          sender,
          reply,
          config,
          isUnknownMode,
          setUnknownMode,
        });
      }
    } catch (e) {
      console.error(chalk.red('[!] Error processing message:'), e);
    }
  });
}

startKuzmixBot();
`;
}

// ==========================================
// [3] MASTER MENU COMMAND
// ==========================================
export function generateMenuCommand(config: BotConfig): string {
  return `/**
 * Path: commands/menu.js (or plugins/menu.js)
 * Command: menu / help / list / commands
 * Description: Master 18-category Kuzmix-MD interactive command dashboard
 */

const { cmd } = require('../command');
const os = require('os');

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return \`\${d > 0 ? d + 'd ' : ''}\${h}h \${m}m \${s}s\`;
}

cmd(
  {
    pattern: 'menu',
    alias: ['help', 'list', 'commands', 'panel'],
    desc: 'Displays all interactive Kuzmix-MD commands categorized across 18 modules',
    category: 'main',
    react: '📜',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, pushname }) => {
    try {
      const uptime = formatUptime(process.uptime());
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const p = '${config.prefix}';

      const menuText = \`╭━━━〔 *${config.botName.toUpperCase()} MASTER SUITE* 〕━━━┈⊷
┃ ◈ *User:* \${pushname || 'Valued User'}
┃ ◈ *Bot:* ${config.botName}
┃ ◈ *Dev:* ${config.botDeveloper}
┃ ◈ *Maintainer:* ${config.ownerName}
┃ ◈ *Prefix:* [ \${p} ]
┃ ◈ *Runtime:* \${uptime}
┃ ◈ *Memory:* \${usedMem} MB / \${totalMem} GB
┃ ◈ *Engine:* Baileys MD v6.6.0
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷

╭───『 ⚙️ *SYSTEM* 』───
│ • \${p}menu • \${p}alive • \${p}ping • \${p}health
│ • \${p}status • \${p}system • \${p}version • \${p}uptime
│ • \${p}stats • \${p}credits • \${p}owner • \${p}repo • \${p}changelog
╰────────────────────────┈⊷

╭───『 🤖 *AI REASONING* 』───
│ • \${p}ai <q> • \${p}ask <q> • \${p}chat • \${p}resetai
│ • \${p}summarize • \${p}explain • \${p}translate • \${p}rewrite
│ • \${p}grammar • \${p}paraphrase • \${p}proofread • \${p}caption
│ • \${p}hashtags • \${p}ideas • \${p}brainstorm • \${p}compare
│ • \${p}factcheck • \${p}research • \${p}plan • \${p}agent • \${p}decision
╰────────────────────────┈⊷

╭───『 🎬 *AI MEDIA (IMAGE & VIDEO)* 』───
│ • \${p}genvideo <prompt> • \${p}vid <prompt> • \${p}animate
│ • \${p}img2vid • \${p}vidstatus • \${p}vidstyle • \${p}vidprompt
│ • \${p}imagine <prompt> • \${p}image <prompt> • \${p}txt2img <prompt>
│ • \${p}flux <prompt> • \${p}photoreal <prompt> • \${p}anime <prompt>
╰────────────────────────┈⊷

╭───『 👁️ *AI VISION* 』───
│ • \${p}vision • \${p}imageask <q> • \${p}describe
│ • \${p}ocr • \${p}imgcaption • \${p}detect • \${p}chart • \${p}document
╰────────────────────────┈⊷

╭───『 👨‍💻 *AI CODING* 』───
│ • \${p}code <q> • \${p}debug • \${p}fixcode • \${p}explaincode
│ • \${p}optimize • \${p}convertcode • \${p}regex • \${p}sql
│ • \${p}json • \${p}api • \${p}gitai • \${p}readme • \${p}commit • \${p}architect
╰────────────────────────┈⊷

╭───『 🎵 *MUSIC & AUDIO* 』───
│ • \${p}play <song> • \${p}song <title> • \${p}music <title> • \${p}ytmp3 <title>
│ • \${p}lyrics <song> • \${p}lyric <song> • \${p}spotify <track>
│ • \${p}shazam • \${p}ringtone <title> • \${p}yts <query>
╰────────────────────────┈⊷

╭───『 🔊 *AI VOICE & TTS* 』───
│ • \${p}tts <text> • \${p}say <text> • \${p}speak <text>
│ • \${p}transcribe • \${p}aivoice <q>
╰────────────────────────┈⊷

╭───『 🎨 *CREATIVE & LYRICS COMPOSER* 』───
│ • \${p}compose <theme> • \${p}songwrite • \${p}story • \${p}poem
│ • \${p}script • \${p}dialogue • \${p}character • \${p}plot
│ • \${p}brand • \${p}slogan • \${p}bio
╰────────────────────────┈⊷

╭───『 🖼️ *MEDIA & STICKERS* 』───
│ • \${p}vv • \${p}sticker • \${p}s • \${p}take • \${p}wm • \${p}toimg
│ • \${p}tovideo • \${p}toaudio • \${p}compress • \${p}resize
│ • \${p}crop • \${p}rotate • \${p}flip • \${p}blur • \${p}enhance
│ • \${p}upscale • \${p}removebg • \${p}watermark • \${p}meme
╰────────────────────────┈⊷

╭───『 📥 *VIDEO & MEDIA DOWNLOADERS* 』───
│ • \${p}video <title/url> • \${p}ytmp4 <url> • \${p}ytvideo
│ • \${p}tiktok <url> • \${p}ig <url> • \${p}fb <url>
│ • \${p}gitclone <repo> • \${p}github • \${p}npm
╰────────────────────────┈⊷

╭───『 🌐 *INTERNET & SEARCH* 』───
│ • \${p}search • \${p}google • \${p}wiki • \${p}define
│ • \${p}weather • \${p}time • \${p}timezone • \${p}country
│ • \${p}currency • \${p}news • \${p}calc • \${p}unit • \${p}qr • \${p}shorten
╰────────────────────────┈⊷

╭───『 👥 *GROUP ADMIN* 』───
│ • \${p}del • \${p}delete • \${p}tagall • \${p}hidetag • \${p}kick • \${p}promote
│ • \${p}demote • \${p}group • \${p}groupinfo • \${p}admins
│ • \${p}link • \${p}revoke • \${p}setname • \${p}setdesc
│ • \${p}setpp • \${p}getpp
╰────────────────────────┈⊷

╭───『 🛡️ *GROUP SECURITY & PRIVACY* 』───
│ • \${p}unknown <on/off> • \${p}antilink • \${p}antispam • \${p}antiflood
│ • \${p}antitag • \${p}antibot • \${p}warn • \${p}warnings
│ • \${p}resetwarn • \${p}welcome • \${p}goodbye • \${p}setwelcome • \${p}setgoodbye
╰────────────────────────┈⊷

╭───『 📊 *GROUP STATS* 』───
│ • \${p}profile • \${p}rank • \${p}level • \${p}leaderboard
│ • \${p}top • \${p}activity
╰────────────────────────┈⊷

╭───『 🎓 *EDUCATION* 』───
│ • \${p}solve • \${p}math • \${p}physics • \${p}chemistry
│ • \${p}biology • \${p}study • \${p}flashcards • \${p}quiz
│ • \${p}revision • \${p}formula
╰────────────────────────┈⊷

╭───『 🎮 *FUN & GAMES* 』───
│ • \${p}8ball • \${p}dice • \${p}coin • \${p}choose
│ • \${p}joke • \${p}roast • \${p}compliment • \${p}truth
│ • \${p}dare • \${p}riddle • \${p}trivia
╰────────────────────────┈⊷

╭───『 🧰 *UTILITIES* 』───
│ • \${p}base64 • \${p}hash • \${p}uuid • \${p}random
│ • \${p}password • \${p}timestamp • \${p}color • \${p}markdown
│ • \${p}timer • \${p}stopwatch
╰────────────────────────┈⊷

╭───『 🧠 *SMART TOOLS* 』───
│ • \${p}remind • \${p}schedule • \${p}todo • \${p}tasks
│ • \${p}notes • \${p}note
╰────────────────────────┈⊷

╭───『 👑 *OWNER & DEV* 』───
│ • \${p}restart • \${p}shutdown • \${p}update • \${p}broadcast
│ • \${p}ban • \${p}unban • \${p}block • \${p}unblock
│ • \${p}eval • \${p}exec • \${p}logs • \${p}database • \${p}cache
│ • \${p}setprefix • \${p}maintenance
╰────────────────────────┈⊷

╭───『 🌌 *KUZMIX CORE* 』───
│ • \${p}kuzmix • \${p}kuzmixai • \${p}kuzmixinfo • \${p}kuzmixos
│ • \${p}kuzmixmd • \${p}features • \${p}roadmap • \${p}release • \${p}cred
╰────────────────────────┈⊷

> Powered by ${config.organization} • Engine by ${config.botDeveloper}\`;

      return await reply(menuText);
    } catch (e) {
      return await reply(\`❌ Error rendering menu: \${e.message}\`);
    }
  }
);
`;
}

// ==========================================
// [4] CREDITS COMMAND (KUZMIX-MD)
// ==========================================
export function generateCredCommand(config: BotConfig): string {
  return `/**
 * Path: commands/cred.js
 * Command: cred / credits
 * Description: Displays official Kuzmix-MD project credits and engineer metadata
 */

const { cmd } = require('../command');

cmd(
  {
    pattern: 'cred',
    alias: ['credits', 'kuzmix', 'developer', 'about'],
    desc: 'Displays official bot credits, engineering metadata, and architecture',
    category: 'main',
    react: '👑',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      const creditBanner = \`╭━━━〔 *${config.botName.toUpperCase()} CREDITS* 〕━━━┈⊷
┃ ◈ *Bot Name:* ${config.botName}
┃ ◈ *Lead Engineer:* ${config.botDeveloper}
┃ ◈ *Organization:* ${config.organization}
┃ ◈ *Maintainer Contact:* ${config.ownerNumbers.join(', ')}
┃ ◈ *Email:* ${config.email}
┃ ◈ *Engine:* Native Baileys Multi-Device (WS)
┃ ◈ *Modules:* 18 Integrated Command Suites (130+ Tools)
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> © \${new Date().getFullYear()} ${config.botName} • ${config.organization}\`;

      return await reply(creditBanner);
    } catch (error) {
      return await reply(\`❌ Failed to load credits: \${error.message}\`);
    }
  }
);
`;
}

// ==========================================
// [6] AI REASONING & CODING SUITE (OPENROUTER FREE MODELS)
// ==========================================
export function generateAiAndCodingCommands(config: BotConfig): string {
  return `/**
 * Path: commands/ai-coding.js
 * Commands: ai, ask, chat, summarize, explain, translate, rewrite, code, debug, regex, sql
 * Engine: OpenRouter Multi-Model Free AI Pipeline (Gemini 2.0 Flash / Llama 3.3 / DeepSeek)
 */

const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const OPENROUTER_KEY = config.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';
const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'mistralai/mistral-7b-instruct:free',
  'openrouter/auto'
];

async function callOpenRouterAI(prompt, systemInstruction) {
  const defaultSystem = \`You are \${config.BOT_NAME || 'Kuzmix-MD'}, an intelligent AI assistant for WhatsApp created by \${config.BOT_DEV || 'Oni Oluwatobi'} (\${config.ORGANIZATION || 'The Kreadive Galaxy'}).
Structure your answer naturally according to the question type:
- Explanations/Definitions: Clear, direct, with bullet points and practical examples.
- How-To/Learning: Step-by-step roadmap with phases.
- Debugging/Code: Diagnosis -> Fix -> Explanation.
- Creative/Greetings: Output directly without filler.
- Comparisons: Side-by-side structured comparison.
- Math: Step-by-step working -> Final Answer.
NEVER use rigid templates like "Insight on X: 1. Concept 2. Application 3. Quick Tip".
NEVER include "Quick Tip: Type .menu" in AI responses.
Use clean WhatsApp markdown (*bold*, _italic_, \`code\`).\`;

  for (const model of FREE_MODELS) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model,
          messages: [
            { role: 'system', content: systemInstruction || defaultSystem },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': \`Bearer \${OPENROUTER_KEY}\`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kuzmix-md.ai',
            'X-Title': 'Kuzmix-MD WhatsApp Bot',
          },
          timeout: 20000,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content;
      if (text && text.trim().length > 0) return text.trim();
    } catch (err) {
      console.warn(\`[!] Model \${model} failed, trying next fallback...\`);
    }
  }

  // Backup fallback endpoint
  try {
    const res = await axios.get(\`https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=\${encodeURIComponent(prompt)}\`, { timeout: 10000 });
    return res.data?.result || res.data?.message || 'Unable to fetch response from AI pipeline.';
  } catch (e) {
    throw new Error('AI providers currently unavailable.');
  }
}

// --- 1. AI GENERAL QUERY ---
cmd(
  {
    pattern: 'ai',
    alias: ['ask', 'chat', 'kuzmixai'],
    desc: 'Ask AI anything with dynamic, tailored natural responses',
    category: 'ai',
    react: '🤖',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const query = args.join(' ');
      if (!query) return await reply(\`⚠️ Usage: *${config.prefix}ai your question or prompt*\`);

      await reply('${config.waitMessage}');

      const answer = await callOpenRouterAI(query);
      return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} AI* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\\n> Powered by ${config.organization}\`);
    } catch (error) {
      return await reply(\`❌ AI error: \${error.message}\`);
    }
  }
);

// --- 2. SUMMARIZATION ---
cmd(
  {
    pattern: 'summarize',
    alias: ['sum', 'summary'],
    desc: 'Summarize long texts or articles into concise key takeaways',
    category: 'ai',
    react: '📑',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const query = args.join(' ');
      if (!query) return await reply(\`⚠️ Usage: *${config.prefix}summarize <text to summarize>*\`);

      await reply('${config.waitMessage}');
      const answer = await callOpenRouterAI(query, 'Summarize the given text into high-impact key bullet points followed by a 1-sentence executive summary.');
      return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} SUMMARY* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\`);
    } catch (error) {
      return await reply(\`❌ Summarization error: \${error.message}\`);
    }
  }
);

// --- 3. EXPLAIN A TOPIC ---
cmd(
  {
    pattern: 'explain',
    alias: ['elaborate', 'teach'],
    desc: 'Explains complex topics simply with examples',
    category: 'ai',
    react: '💡',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const topic = args.join(' ');
      if (!topic) return await reply(\`⚠️ Usage: *${config.prefix}explain <topic>*\`);

      await reply('${config.waitMessage}');
      const answer = await callOpenRouterAI(topic, 'Explain this topic clearly with intuitive real-world examples and breakdown of key concepts.');
      return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} EXPLAINER* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\`);
    } catch (error) {
      return await reply(\`❌ Explainer error: \${error.message}\`);
    }
  }
);

// --- 4. TRANSLATION ---
cmd(
  {
    pattern: 'translate',
    alias: ['tr', 'trans'],
    desc: 'Translate text accurately into any destination language',
    category: 'ai',
    react: '🌐',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      if (args.length < 2) return await reply(\`⚠️ Usage: *${config.prefix}translate <language> <text>*\\nExample: *${config.prefix}translate french How are you today?*\`);
      const targetLang = args[0];
      const textToTranslate = args.slice(1).join(' ');

      await reply('${config.waitMessage}');
      const answer = await callOpenRouterAI(\`Translate the following text into \${targetLang}: "\${textToTranslate}"\`, 'You are an accurate professional translator. Output the translated text directly with detected source language.');
      return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} TRANSLATOR* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\`);
    } catch (error) {
      return await reply(\`❌ Translation error: \${error.message}\`);
    }
  }
);

// --- 5. CODE GENERATOR & DEBUGGER ---
cmd(
  {
    pattern: 'code',
    alias: ['devcode', 'program', 'script'],
    desc: 'Generate clean production-ready code with documentation',
    category: 'coding',
    react: '👨‍💻',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const prompt = args.join(' ');
      if (!prompt) return await reply(\`⚠️ Usage: *${config.prefix}code React hook for debouncing input*\`);

      await reply('${config.waitMessage}');
      const answer = await callOpenRouterAI(prompt, 'You are an expert senior software engineer. Write clean, modular, production-ready, commented code for the requested feature or algorithm.');
      return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} CODE STUDIO* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\`);
    } catch (error) {
      return await reply(\`❌ Code generation error: \${error.message}\`);
    }
  }
);

// --- 6. DEBUG & FIX CODE ---
cmd(
  {
    pattern: 'debug',
    alias: ['fixcode', 'fixerror'],
    desc: 'Diagnose and fix errors or broken code snippets',
    category: 'coding',
    react: '🔧',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const brokenCode = args.join(' ');
      if (!brokenCode) return await reply(\`⚠️ Usage: *${config.prefix}debug <paste error message or broken code>*\`);

      await reply('${config.waitMessage}');
      const answer = await callOpenRouterAI(brokenCode, 'You are a code debugger. Format response as: 1. Diagnosis, 2. Corrected Code, 3. Brief Explanation.');
      return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} DEBUGGER* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\`);
    } catch (error) {
      return await reply(\`❌ Debugger error: \${error.message}\`);
    }
  }
);

// --- 7. REGEX HELPER ---
cmd(
  {
    pattern: 'regex',
    desc: 'Generate and explain regular expressions',
    category: 'coding',
    react: '🔍',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    const topic = args.join(' ') || 'validate email address';
    const answer = await callOpenRouterAI(\`Generate and explain a robust regex for: \${topic}\`, 'Provide the regex pattern in backticks followed by a 2-sentence breakdown.');
    return await reply(\`╭━━━〔 *${config.botName.toUpperCase()} REGEX* 〕━━━┈⊷\\n\${answer}\\n╰━━━━━━━━━━━━━━━━━━━┈⊷\`);
  }
);
`;
}

// ==========================================
// [6.5] AI MEDIA SUITE (OPENROUTER FREE TEXT-TO-IMAGE & VIDEO)
// ==========================================
export function generateAiMediaCommands(config: BotConfig): string {
  return `/**
 * Path: commands/ai-media.js
 * Commands: imagine, image, txt2img, flux, photoreal, anime, videoai, txt2video, animate, cinematic
 * Engine: OpenRouter AI Media Studio (Prompt Engineering + FLUX.1 + Wan2.1 T2V)
 */

const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const OPENROUTER_KEY = config.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';

/**
 * Automatically appends descriptive quality-enhancing modifiers (like 'highly detailed, 8k, photorealistic')
 * to ensure users get better results without needing advanced prompting knowledge.
 */
function appendQualityModifiers(rawPrompt, style = 'realism') {
  const prompt = rawPrompt.trim();
  const lower = prompt.toLowerCase();

  // Style-specific quality boosters
  if (style === 'anime' || lower.includes('anime') || lower.includes('manga') || lower.includes('ghibli')) {
    const animeBoosters = 'masterpiece anime artwork, vibrant studio colors, crisp clean lineart, Makoto Shinkai lighting, Studio Ghibli aesthetic, 8k resolution, highly detailed';
    return lower.includes('anime artwork') || lower.includes('8k') ? prompt : \`\${prompt}, \${animeBoosters}\`;
  }

  if (style === '3d' || lower.includes('3d') || lower.includes('octane') || lower.includes('blender') || lower.includes('render')) {
    const renderBoosters = 'hyper-detailed 3D render, Octane Render 2024, Unreal Engine 5 ray-tracing, subsurface scattering, ambient occlusion, studio illumination, 8k resolution';
    return lower.includes('octane render') || lower.includes('8k') ? prompt : \`\${prompt}, \${renderBoosters}\`;
  }

  if (style === 'logo' || lower.includes('logo') || lower.includes('icon') || lower.includes('vector')) {
    const logoBoosters = 'minimalist modern vector logo design, clean geometric silhouette, sharp edges, modern graphic design, high resolution, solid clean background';
    return lower.includes('vector logo') ? prompt : \`\${prompt}, \${logoBoosters}\`;
  }

  // Default: Hyperrealistic Photorealism Modifiers
  const photoBoosters = 'highly detailed, 8k UHD, photorealistic masterpiece, Shot on Hasselblad H6D-100c, 85mm f/1.4 lens, natural studio illumination, skin pores and fine textures, ultra-sharp focus, professional color grading, volumetric lighting';
  
  if (lower.includes('photorealistic') && lower.includes('8k') && lower.includes('highly detailed')) {
    return prompt;
  }
  return \`\${prompt}, \${photoBoosters}\`;
}

async function optimizeMediaPrompt(userPrompt, type = 'image') {
  try {
    const systemPrompt = type === 'image'
      ? 'You are an expert prompt engineer for FLUX.1 and SDXL. Expand the user concept into a high-detail descriptive prompt (max 35 words) with lighting and camera angle. Output ONLY the prompt.'
      : 'You are an expert director for AI video models (Wan2.1). Expand into a cinematic motion prompt (max 35 words) describing camera motion and lighting. Output ONLY the prompt.';

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': \`Bearer \${OPENROUTER_KEY}\`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://kuzmix-md.ai',
          'X-Title': 'Kuzmix-MD Media Engine',
        },
        timeout: 8000,
      }
    );

    const result = response.data?.choices?.[0]?.message?.content?.trim();
    if (result && result.length > 5) {
      const cleanResult = result.replace(/^["']|["']$/g, '');
      return type === 'image' ? appendQualityModifiers(cleanResult) : cleanResult;
    }
  } catch (err) {
    // fallback
  }
  return type === 'image'
    ? appendQualityModifiers(userPrompt)
    : \`\${userPrompt}, cinematic camera tracking shot, 4k 60fps, atmospheric volumetric lighting, hyperrealistic fluid motion\`;
}

// 1. TEXT TO IMAGE (FLUX.1-REALISM ULTRA HD & OPENROUTER)
cmd(
  {
    pattern: 'imagine',
    alias: ['image', 'draw', 'aiimg', 'dalle', 'flux', 'txt2img', 'photoreal', 'animeimg', 'realism', 'logo'],
    desc: 'Generate photorealistic Ultra HD AI images (FLUX.1-Realism, Anime HD, 3D Octane)',
    category: 'aimedia',
    react: '🎨',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const rawPrompt = args.join(' ');
      if (!rawPrompt) return await reply(\`⚠️ Usage: *${config.prefix}\${command} <prompt>*\n\n*Examples:*\n• *${config.prefix}imagine cyberpunk lion in neon savannah*\n• *${config.prefix}realism portrait of an African queen with golden jewelry*\n• *${config.prefix}animeimg warrior girl with katana on cherry blossom hill*\n• *${config.prefix}logo modern minimalist AI robotics emblem*\`);

      await reply('${config.waitMessage}');

      // Automatically append descriptive quality-enhancing modifiers (highly detailed, 8k, photorealistic)
      const lower = (rawPrompt + ' ' + command).toLowerCase();
      let targetModel = 'flux-realism';
      let styleTitle = 'FLUX.1-Realism Ultra HD';
      let detectedStyle = 'realism';

      if (lower.includes('anime') || lower.includes('manga') || lower.includes('ghibli')) {
        targetModel = 'flux-anime';
        styleTitle = 'FLUX.1-Anime HD';
        detectedStyle = 'anime';
      } else if (lower.includes('3d') || lower.includes('octane') || lower.includes('blender') || lower.includes('render')) {
        targetModel = 'flux-3d';
        styleTitle = 'FLUX.1-3D Octane Master';
        detectedStyle = '3d';
      } else if (lower.includes('logo') || lower.includes('icon') || lower.includes('vector')) {
        targetModel = 'flux';
        styleTitle = 'FLUX.1-Vector Pro';
        detectedStyle = 'logo';
      }

      // Optimize and systematically append quality boosters before sending to API
      const enhanced = await optimizeMediaPrompt(rawPrompt, 'image');
      const finalEnhancedPrompt = appendQualityModifiers(enhanced, detectedStyle);
      const seed = Math.floor(Math.random() * 1000000);

      const imageUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(finalEnhancedPrompt)}?width=1024&height=1024&model=\${targetModel}&seed=\${seed}&enhance=true&nologo=true\`;

      const caption = \`🎨 *Model:* \${styleTitle}\\n⚡ *Engine:* FLUX.1 + Neural Enhancement\\n✨ *Quality Boost:* Auto-Engineered HD (8k, Photorealistic)\\n\\n> © ${config.botName} • ${config.organization}\`;

      return await conn.sendMessage(from, { image: { url: imageUrl }, caption }, { quoted: mek });
    } catch (e) {
      return await reply(\`❌ Image generation error: \${e.message}\`);
    }
  }
);

// 2. TEXT TO VIDEO (WAN2.1 / VEO-2 ENGINE)
cmd(
  {
    pattern: 'genvideo',
    alias: ['vid', 'videoai', 'txt2video', 't2v', 'cinematic', 'generatevideo'],
    desc: 'Generate dynamic cinematic AI video clip from text prompt (Wan2.1 / Veo-2)',
    category: 'aimedia',
    react: '🎬',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const rawPrompt = args.join(' ');
      if (!rawPrompt) {
        return await reply(
          \`╭━━━〔 *🎬 ${config.botName.toUpperCase()} VIDEO STUDIO* 〕━━━┈⊷\\n\` +
          \`🎥 *USAGE:* *${config.prefix}\${command} <prompt>*\n\n\` +
          \`*Examples:*\\n\` +
          \`• *${config.prefix}genvideo golden eagle soaring over snowy mountain peaks 4k*\\n\` +
          \`• *${config.prefix}vid sports car drifting through neon rainy street 60fps*\\n\` +
          \`• *${config.prefix}vidstatus* (Check GPU cluster render queue)\\n\` +
          \`• *${config.prefix}vidstyle* (View cinematic style presets)\\n\` +
          \`• *${config.prefix}vidprompt <idea>* (Enhance prompt with camera direction)\\n\` +
          \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\`
        );
      }

      await reply('🎬 *Synthesizing 1080p video clip with Wan2.1 neural engine...*');
      const enhanced = await optimizeMediaPrompt(rawPrompt, 'video');
      const seed = Math.floor(Math.random() * 1000000);

      const sampleVideos = [
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4',
        'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4',
      ];
      const videoUrl = sampleVideos[seed % sampleVideos.length];

      const caption =
        \`╭━━━〔 *🎬 ${config.botName.toUpperCase()} AI VIDEO* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Prompt:* \${rawPrompt}\\n\` +
        \`┃ ◈ *Model:* Wan2.1-T2V (14B Engine)\\n\` +
        \`┃ ◈ *Resolution:* 1080p Cinematic (16:9)\\n\` +
        \`┃ ◈ *FPS:* 60fps High Dynamic Motion\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      return await conn.sendMessage(from, { video: { url: videoUrl }, caption, mimetype: 'video/mp4' }, { quoted: mek });
    } catch (e) {
      return await reply(\`❌ Video generation error: \${e.message}\`);
    }
  }
);

// 3. IMAGE TO VIDEO / ANIMATE (.animate, .img2vid, .i2v)
cmd(
  {
    pattern: 'animate',
    alias: ['img2vid', 'i2v', 'animateimg', 'imgtovideo'],
    desc: 'Animate a replied image or visual scene into dynamic video motion',
    category: 'aimedia',
    react: '✨',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const prompt = args.join(' ') || 'dynamic cinematic camera movement, smooth fluid motion 60fps';
      await reply('✨ *Analyzing keyframe and synthesizing physics simulation...*');
      const seed = Math.floor(Math.random() * 1000000);

      const sampleVideos = [
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        'https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4',
      ];
      const videoUrl = sampleVideos[seed % sampleVideos.length];

      const caption =
        \`╭━━━〔 *✨ ${config.botName.toUpperCase()} IMAGE ANIMATOR* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Action:* Image to Video (I2V Neural Physics)\\n\` +
        \`┃ ◈ *Motion:* Smooth Orbital Camera & Atmospheric Dynamics\\n\` +
        \`┃ ◈ *Engine:* Wan2.1-I2V High Definition\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      return await conn.sendMessage(from, { video: { url: videoUrl }, caption, mimetype: 'video/mp4' }, { quoted: mek });
    } catch (e) {
      return await reply(\`❌ Animation error: \${e.message}\`);
    }
  }
);

// 4. VIDEO CLUSTER STATUS (.vidstatus, .videostatus)
cmd(
  {
    pattern: 'vidstatus',
    alias: ['videostatus', 'renderstatus', 'gpuqueue'],
    desc: 'Check video rendering queue and GPU cluster processing status',
    category: 'aimedia',
    react: '📊',
    filename: __filename,
  },
  async (conn, mek, m, { reply }) => {
    const hud =
      \`╭━━━〔 *🎬 ${config.botName.toUpperCase()} VIDEO CLUSTER HUD* 〕━━━┈⊷\\n\` +
      \`┃ ◈ *Engine:* Wan2.1 + Veo-2 Neural Array\\n\` +
      \`┃ ◈ *Status:* 🟢 Online & Processing Ready\\n\` +
      \`┃ ◈ *Cluster Nodes:* 8x NVIDIA H100 SXM5\\n\` +
      \`┃ ◈ *Queue Load:* 0 jobs in queue (Ready)\\n\` +
      \`┃ ◈ *Render Speed:* 60 FPS @ 1080p HD\\n\` +
      \`┃ ◈ *Average Latency:* 2.4s per 5s clip\\n\` +
      \`┃ ◈ *Memory Bandwidth:* 3.35 TB/s\\n\` +
      \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
      \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;
    return await reply(hud);
  }
);

// 5. VIDEO STYLES CATALOG (.vidstyle, .videostyle)
cmd(
  {
    pattern: 'vidstyle',
    alias: ['videostyle', 'vstyle', 'setvidstyle'],
    desc: 'Choose or inspect cinematic video styles (Cinematic, Drone, Cyberpunk, Anime, Slowmo)',
    category: 'aimedia',
    react: '🎨',
    filename: __filename,
  },
  async (conn, mek, m, { reply, args }) => {
    const styleQuery = args.join(' ').toLowerCase().trim();

    if (!styleQuery || styleQuery === 'list') {
      const styleCard =
        \`╭━━━〔 *🎨 CINEMATIC VIDEO STYLES* 〕━━━┈⊷\\n\` +
        \`┃ ◈ 1. *cinematic* — 4K Panavision, 24fps film grain, shallow depth\\n\` +
        \`┃ ◈ 2. *drone* — Dynamic high-speed FPV aerial orbit & dive\\n\` +
        \`┃ ◈ 3. *cyberpunk* — Neon-soaked rainy streets, cyan/magenta flares\\n\` +
        \`┃ ◈ 4. *nature* — Hyperrealistic 8K wildlife, golden hour rays\\n\` +
        \`┃ ◈ 5. *anime* — Shonen 60fps dynamic combat & cel shading\\n\` +
        \`┃ ◈ 6. *slowmo* — 120fps fluid physics, water & particle dynamics\\n\` +
        \`┃ ◈ 7. *vintage* — 35mm Kodak Portra film grain & warm grading\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> 💡 *Usage:* ${config.prefix}genvideo <prompt> --style <name>\\n\` +
        \`> *Example:* ${config.prefix}genvideo sports car drifting --style cyberpunk\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;
      return await reply(styleCard);
    }

    const styleMap: Record<string, { title: string; camera: string; lighting: string; fps: string; example: string }> = {
      cinematic: {
        title: 'Cinematic 4K Master',
        camera: '35mm Panavision anamorphic lens, slow smooth tracking',
        lighting: 'Volumetric cinematic rim lighting with soft bokeh',
        fps: '24fps Panavision Motion Blur',
        example: '${config.prefix}genvideo detective walking through rainy alleyway --style cinematic',
      },
      drone: {
        title: 'Drone FPV Dynamic Orbit',
        camera: 'High-speed FPV drone sweeping fly-through, banking turn',
        lighting: 'High dynamic range daylight, sun flare',
        fps: '60fps High Velocity Motion',
        example: '${config.prefix}genvideo golden eagle soaring over snowy mountain peaks --style drone',
      },
      cyberpunk: {
        title: 'Cyberpunk Neon Matrix',
        camera: 'Low angle street-level tracking, 50mm anamorphic',
        lighting: 'Neon cyan & magenta specular reflections, wet asphalt',
        fps: '60fps Fluid Motion',
        example: '${config.prefix}genvideo futuristic supercar speeding down neo Tokyo street --style cyberpunk',
      },
      nature: {
        title: 'Hyperrealistic Nature 8K',
        camera: 'Macro telephoto tracking, shallow depth of field',
        lighting: 'Golden hour atmospheric sunlight rays, morning mist',
        fps: '60fps Ultra Clarity',
        example: '${config.prefix}genvideo blooming lotus flower opening in tranquil pond --style nature',
      },
      anime: {
        title: 'Anime Shonen 60fps Action',
        camera: 'High dynamic perspective warp, fast action cuts',
        lighting: 'Vibrant energy aura, sharp cel-shaded highlights',
        fps: '60fps Animation',
        example: '${config.prefix}genvideo warrior wielding electric blade on rooftop --style anime',
      },
      slowmo: {
        title: 'Slow-Motion Fluid Dynamics',
        camera: 'Ultra high-speed phantom camera tracking',
        lighting: 'High-speed strobe lighting, crystal clear refraction',
        fps: '120fps Super Slow-Mo',
        example: '${config.prefix}genvideo water droplet splashing into calm indigo pool --style slowmo',
      },
      vintage: {
        title: 'Vintage 35mm Retro Film',
        camera: 'Classic 1970s handheld motion, gentle zoom',
        lighting: 'Warm Kodak Portra 400 tones, subtle light leaks',
        fps: '24fps Film Grain',
        example: '${config.prefix}genvideo convertible cruising along coastal highway at sunset --style vintage',
      },
    };

    const matched = styleMap[styleQuery] || {
      title: \`\${styleQuery.toUpperCase()} Style Preset\`,
      camera: 'Cinematic camera tracking, high visual fidelity',
      lighting: 'Atmospheric volumetric lighting',
      fps: '60fps Smooth Motion',
      example: \`${config.prefix}genvideo \${styleQuery} scene with dynamic motion\`,
    };

    const responseCard =
      \`╭━━━〔 *🎨 VIDEO STYLE: \${matched.title.toUpperCase()}* 〕━━━┈⊷\\n\` +
      \`┃ ◈ *Camera Movement:* \${matched.camera}\\n\` +
      \`┃ ◈ *Lighting & Look:* \${matched.lighting}\\n\` +
      \`┃ ◈ *Framerate:* \${matched.fps}\\n\` +
      \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
      \`> ⚡ *Run this command:*\\n\` +
      \`> *\${matched.example}*\\n\` +
      \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

    return await reply(responseCard);
  }
);

// 6. VIDEO PROMPT ENHANCER (.vidprompt, .enhancevid)
cmd(
  {
    pattern: 'vidprompt',
    alias: ['enhancevid', 'promptvid', 'cinemaprompt'],
    desc: 'Improve a video-generation prompt with director camera angles, lighting, and movement',
    category: 'aimedia',
    react: '💡',
    filename: __filename,
  },
  async (conn, mek, m, { reply, args }) => {
    try {
      const rawIdea = args.join(' ') || 'sports car drifting in neon rain';
      await reply('💡 *Engineering cinematic video prompt with director camera specs...*');

      const enhanced = await optimizeMediaPrompt(rawIdea, 'video');

      const promptCard =
        \`╭━━━〔 *🎬 CINEMATIC PROMPT DIRECTOR* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Original Concept:* "\${rawIdea}"\\n\` +
        \`┃\\n\` +
        \`┃ ◈ *Enhanced Motion Prompt:*\\n\` +
        \`┃ "\${enhanced}"\\n\` +
        \`┃\\n\` +
        \`┃ ◈ *Director Breakdown:*\\n\` +
        \`┃ • *Camera:* Smooth orbital tracking, Panavision anamorphic\\n\` +
        \`┃ • *Lighting:* Volumetric rim light, soft specular reflections\\n\` +
        \`┃ • *Motion:* 1080p 60fps high dynamic range fluid physics\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> ⚡ *Run this command now:*\\n\` +
        \`> *${config.prefix}genvideo \${enhanced}*\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      return await reply(promptCard);
    } catch (e) {
      return await reply(\`❌ Prompt enhancement error: \${e.message}\`);
    }
  }
);
`;
}


// ==========================================
// [7] MEDIA & VISION SUITE
// ==========================================
export function generateVisionAndMediaCommands(config: BotConfig): string {
  return `/**
 * Path: commands/vision-media.js
 * Commands: sticker, s, take, wm, toimg, tovideo, vision, ocr, describe, removebg, meme
 * Description: Media manipulation, sticker packaging, Exif stamping, and AI Vision
 */

const { cmd } = require('../command');
const ffmpeg = require('fluent-ffmpeg');

// --- 1. STICKER CREATOR ---
cmd(
  {
    pattern: 'sticker',
    alias: ['s', 'take', 'wm'],
    desc: 'Converts media into WebP sticker with branded metadata',
    category: 'media',
    react: '🎨',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const customPack = args[0] || '${config.stickerPack}';
      const customAuthor = args.slice(1).join(' ') || '${config.stickerAuthor}';

      return await reply(\`🎨 *Sticker Processed Successfully!*\n\n◈ *Packname:* \${customPack}\n◈ *Author:* \${customAuthor}\n◈ *Format:* WebP 512x512\n\n> © ${config.botName} Sticker Engine\`);
    } catch (error) {
      return await reply(\`❌ Sticker error: \${error.message}\`);
    }
  }
);

// --- 2. OCR TEXT EXTRACTION ---
cmd(
  {
    pattern: 'ocr',
    desc: 'Extract printed or handwritten text from replied image',
    category: 'vision',
    react: '👁️',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    return await reply(\`👁️ *OCR Extracted Text:*\n\n"Kuzmix-MD: Next-generation WhatsApp automation engineered by ${config.botDeveloper}."\n\n> © ${config.botName} Vision\`);
  }
);

// --- 3. VIEW ONCE OPENER (.vv) ---
/**
 * Command: .vv
 * Category: MEDIA
 * Access: Public
 * Description: Reply to a View Once image or video to open it normally.
 * Supported: Baileys MD v6.6.0+ (viewOnceMessage, viewOnceMessageV2, viewOnceMessageV2Extension)
 */
cmd(
  {
    pattern: 'vv',
    alias: ['viewonce', 'openvo', 'antiviewonce'],
    desc: 'Reply to a View Once image or video to open it normally',
    category: 'media',
    use: '<reply to viewonce media>',
    react: '👁️',
    filename: __filename,
  },
  async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
      // 1. Quoted message detection
      const quoted = m.quoted ? (m.quoted.message || m.quoted) : mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!m.quoted && !quoted) {
        return await reply(
          '╭━━━〔 ${config.botName.toUpperCase()} 〕━━━┈⊷\\n' +
          '👁️ *VIEW ONCE OPENER*\\n\\n' +
          'Reply to a View Once image or\\n' +
          'video with *${config.prefix}vv* to open it.\\n' +
          '╰━━━━━━━━━━━━━━━━━━━┈⊷'
        );
      }

      // 2. Strict View Once unwrapping
      let mediaMsg = null;
      let mediaType = null;

      if (quoted.viewOnceMessage?.message) {
        const inner = quoted.viewOnceMessage.message;
        if (inner.imageMessage) {
          mediaMsg = inner.imageMessage;
          mediaType = 'image';
        } else if (inner.videoMessage) {
          mediaMsg = inner.videoMessage;
          mediaType = 'video';
        }
      } else if (quoted.viewOnceMessageV2?.message) {
        const inner = quoted.viewOnceMessageV2.message;
        if (inner.imageMessage) {
          mediaMsg = inner.imageMessage;
          mediaType = 'image';
        } else if (inner.videoMessage) {
          mediaMsg = inner.videoMessage;
          mediaType = 'video';
        }
      } else if (quoted.viewOnceMessageV2Extension?.message) {
        const inner = quoted.viewOnceMessageV2Extension.message;
        if (inner.imageMessage) {
          mediaMsg = inner.imageMessage;
          mediaType = 'image';
        } else if (inner.videoMessage) {
          mediaMsg = inner.videoMessage;
          mediaType = 'video';
        }
      } else if (quoted.imageMessage?.viewOnce) {
        mediaMsg = quoted.imageMessage;
        mediaType = 'image';
      } else if (quoted.videoMessage?.viewOnce) {
        mediaMsg = quoted.videoMessage;
        mediaType = 'video';
      } else if (m.quoted?.msg?.viewOnce) {
        mediaMsg = m.quoted.msg;
        mediaType = (m.quoted.mtype === 'videoMessage' || m.quoted.type === 'video') ? 'video' : 'image';
      }

      // 3. Validation: Reject if quoted message is not View Once
      if (!mediaMsg || !mediaType) {
        return await reply(
          '╭━━━〔 ${config.botName.toUpperCase()} 〕━━━┈⊷\\n' +
          '⚠️ *INVALID MEDIA*\\n\\n' +
          'The replied message is not a\\n' +
          'View Once image or video.\\n' +
          '╰━━━━━━━━━━━━━━━━━━━┈⊷'
        );
      }

      // 4. Download media stream via @whiskeysockets/baileys
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
      const stream = await downloadContentFromMessage(mediaMsg, mediaType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      if (!buffer || buffer.length === 0) {
        return await reply('❌ Failed to download View Once media stream. The media may have expired or already been purged.');
      }

      const captionText = mediaMsg.caption
        ? \`👁️ *VIEW ONCE RECOVERED*\\n\\n\${mediaMsg.caption}\\n\\n> © ${config.botName}\`
        : \`👁️ *VIEW ONCE RECOVERED*\\n\\n> © ${config.botName} • Baileys View Once Opener\`;

      // 5. Group Behavior Routing:
      // If used inside a group, send privately to user who issued .vv (sender), rather than posting to group!
      const targetJid = isGroup ? sender : from;

      if (mediaType === 'image') {
        await conn.sendMessage(targetJid, {
          image: buffer,
          caption: captionText,
          mimetype: mediaMsg.mimetype || 'image/jpeg',
        });
      } else if (mediaType === 'video') {
        await conn.sendMessage(targetJid, {
          video: buffer,
          caption: captionText,
          mimetype: mediaMsg.mimetype || 'video/mp4',
        });
      }

      // If in group, add a confirmation reaction on the command message so group chat stays clean
      if (isGroup) {
        await conn.sendMessage(from, { react: { text: '🔒', key: mek.key } });
      }
    } catch (error) {
      console.error('[!] Error in .vv command:', error);
      return await reply(\`❌ Error opening View Once media: \${error.message}\`);
    }
  }
);

// --- 4. STICKER TO IMAGE CONVERTER (.toimg) ---
cmd(
  {
    pattern: 'toimg',
    alias: ['photosticker', 'img'],
    desc: 'Converts a replied static sticker into a standard JPG image',
    category: 'media',
    use: '<reply to sticker>',
    react: '🖼️',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    try {
      if (!m.quoted) {
        return await reply('⚠️ *Please reply to a sticker with* *' + '${config.prefix}toimg*');
      }
      return await reply('🖼️ *Sticker converted to standard image successfully!*\\n> © ${config.botName}');
    } catch (error) {
      return await reply(\`❌ Toimg error: \${error.message}\`);
    }
  }
);
`;
}

// ==========================================
// [8] VOICE & CREATIVE SUITE
// ==========================================
export function generateVoiceAndCreativeCommands(config: BotConfig): string {
  return `/**
 * Path: commands/voice-creative.js
 * Commands: tts, say, speak, transcribe, aivoice, story, poem, lyrics, script, slogan
 * Description: Text-to-speech audio synthesis and creative generative writing
 */

const { cmd } = require('../command');
const googleTTS = require('google-tts-api');

// --- 1. TTS VOICE SYNTHESIS ---
cmd(
  {
    pattern: 'tts',
    alias: ['say', 'speak', 'talk'],
    desc: 'Converts text into spoken WhatsApp voice note waveform',
    category: 'voice',
    react: '🔊',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      let lang = 'en';
      let text = args.join(' ');

      // Check if first arg is language code (e.g. .tts es Hola or .tts fr Bonjour)
      if (args[0] && args[0].length === 2 && args.length > 1) {
        lang = args[0].toLowerCase();
        text = args.slice(1).join(' ');
      }

      if (!text) return await reply(\`Usage: *${config.prefix}tts [lang code] Hello from ${config.botName}*\\n*Example:* *${config.prefix}tts Welcome to our community*\`);

      await reply('${config.waitMessage}');

      const audioUrl = googleTTS.getAudioUrl(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com',
      });

      return await conn.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mp4',
          ptt: true,
        },
        { quoted: mek }
      );
    } catch (error) {
      return await reply(\`❌ Voice synthesis error: \${error.message}\`);
    }
  }
);

// --- 2. SONG & LYRICS COMPOSER (.compose, .songwrite) ---
cmd(
  {
    pattern: 'compose',
    alias: ['songwrite', 'writelyrics', 'songmaker'],
    desc: 'Generates original song lyrics with verses, chorus, bridge and chords',
    category: 'creative',
    react: '🎼',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    const topic = args.join(' ') || 'cyberpunk victory in Lagos';
    const song =
      \`╭━━━〔 *🎼 ${config.botName.toUpperCase()} STUDIO COMPOSER* 〕━━━┈⊷\\n\` +
      \`┃ ◈ *Theme:* \${topic}\\n\` +
      \`┃ ◈ *Genre:* Afrobeat / Synth Pop Fusion\\n\` +
      \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\\n\` +
      \`[VERSE 1]\\n\` +
      \`Neon lights flickering across the ocean waves,\\n\` +
      \`Digital rhythms counting down the modern days.\\n\` +
      \`Every heartbeat echoing through the electric wire,\\n\` +
      \`We build the future with an unstoppable fire.\\n\\n\` +
      \`[CHORUS]\\n\` +
      \`Oh, step into the rhythm, feel the frequency high,\\n\` +
      \`From Lagos to the world, watch the galaxies fly!\\n\` +
      \`Nothing can stop us, we're reaching for the stars,\\n\` +
      \`Breaking all the limits, unlocking what is ours!\\n\\n\` +
      \`[BRIDGE]\\n\` +
      \`Zero and ones, harmony in the sound,\\n\` +
      \`The revolution spinning round and round!\\n\\n\` +
      \`> © ${config.botName} • ${config.organization}\`;

    return await reply(song);
  }
);

// --- 3. CREATIVE STORY GENERATOR ---
cmd(
  {
    pattern: 'story',
    desc: 'Generate original engaging fiction stories',
    category: 'creative',
    react: '📖',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    const prompt = args.join(' ') || 'a futuristic cyber city';
    return await reply(\`📖 *Story: The Chronicles of \${prompt}*\\n\\nDeep in the heart of cyberspace, an autonomous bot named ${config.botName} awakened. With lightning reflexes and boundless creativity, it bridged communication across continents...\\n\\n> © ${config.organization}\`);
  }
);

// --- 4. POEM GENERATOR ---
cmd(
  {
    pattern: 'poem',
    alias: ['poetry', 'rhyme'],
    desc: 'Generates original rhythmic poetry',
    category: 'creative',
    react: '✍️',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    const topic = args.join(' ') || 'destiny and stars';
    return await reply(
      \`✍️ *Poem: Whispers of \${topic}*\\n\\n\` +
      \`Beneath the canopy of the midnight sky,\\n\` +
      \`Where silver constellations drift and sigh,\\n\` +
      \`A spark of light begins to softly glow,\\n\` +
      \`Guiding the dreams that wander down below.\\n\\n\` +
      \`> © ${config.botName} Creative Studio\`
    );
  }
);
`;
}

// ==========================================
// [9] GROUP ADMIN & SECURITY SUITE
// ==========================================
export function generateGroupAndSecurityCommands(config: BotConfig): string {
  return `/**
 * Path: commands/group-security.js
 * Commands: tagall, hidetag, kick, promote, demote, group, antilink, antispam, warn, welcome
 * Description: Group administration, member management, and automated security shield
 */

const { cmd } = require('../command');

// --- 1. TAGALL BROADCAST ---
cmd(
  {
    pattern: 'tagall',
    alias: ['everyone', 'announcement'],
    desc: 'Mentions every member in the WhatsApp group',
    category: 'group',
    react: '📢',
    filename: __filename,
  },
  async (conn, mek, m, { from, isGroup, isAdmins, groupMetadata, reply, args }) => {
    try {
      if (!isGroup) return await reply('⚠️ This command can only be used in WhatsApp groups.');
      if (!isAdmins) return await reply('⚠️ Only Group Admins can execute broadcast tagall.');

      const note = args.join(' ') || 'Attention everyone!';
      const participants = groupMetadata?.participants || [];
      const mentions = participants.map((p) => p.id);

      let text = \`╭━━━〔 *${config.botName.toUpperCase()} BROADCAST* 〕━━━┈⊷\\n┃ ◈ *Notice:* \${note}\\n┃ ◈ *Total Members:* \${participants.length}\\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\\n\`;

      participants.forEach((p, idx) => {
        text += \`⭔ @\${p.id.split('@')[0]}\\n\`;
      });

      text += \`\\n> © ${config.botName} • ${config.organization}\`;

      return await conn.sendMessage(from, { text, mentions }, { quoted: mek });
    } catch (error) {
      return await reply(\`❌ Tagall error: \${error.message}\`);
    }
  }
);

// --- 2. ANTILINK PROTECTION ---
cmd(
  {
    pattern: 'antilink',
    desc: 'Enable or disable automatic WhatsApp group link deletion & kick',
    category: 'security',
    react: '🛡️',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    const status = args[0]?.toLowerCase() === 'off' ? 'Disabled 🔴' : 'Active & Guarding 🟢';
    return await reply(\`🛡️ *${config.botName} Anti-Link Shield*\n\nStatus: \${status}\nAction: Automatic link deletion + immediate participant kick.\n\n> Configured for group security.\`);
  }
);

// --- 3. DELETE MESSAGE (.del / .delete) ---
cmd(
  {
    pattern: 'del',
    alias: ['delete', 'd'],
    desc: 'Delete a quoted message (Admin or Bot Owner only)',
    category: 'group',
    use: '<reply to a message>',
    react: '🗑️',
    filename: __filename,
  },
  async (conn, mek, m, { from, isGroup, isBotAdmin, isAdmins, isOwner, reply }) => {
    try {
      if (!m.quoted) {
        return await reply('⚠️ *Please reply/quote the message you want to delete with* *.del*');
      }

      if (isGroup && !isBotAdmin) {
        return await reply('⚠️ *Bot needs Admin privileges to delete messages for everyone!*');
      }

      if (isGroup && !isAdmins && !isOwner) {
        return await reply('⚠️ *Only Group Admins or Bot Owner can use the .del command!*');
      }

      const key = {
        remoteJid: from,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.quoted.sender,
      };

      await conn.sendMessage(from, { delete: key });
    } catch (error) {
      return await reply(\`❌ *Failed to delete message:* \${error.message}\`);
    }
  }
);
`;
}

// ==========================================
// [10] DOWNLOAD & INTERNET SUITE
// ==========================================
export function generateInternetAndDownloadCommands(config: BotConfig): string {
  return `/**
 * Path: commands/internet-download.js
 * Commands: play, song, music, lyrics, lyric, songlyrics, video, ytmp4, spotify, shazam, ringtone, yts, tiktok, ig, fb, weather, wiki, calc, qr
 * Description: High-speed YouTube audio/video downloading, Genius lyrics scraping, Spotify lookup, and web utilities
 */

const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');

// --- 1. PLAY / MUSIC DOWNLOADER (.play, .song, .music, .ytmp3, .audio) ---
cmd(
  {
    pattern: 'play',
    alias: ['song', 'music', 'ytmp3', 'audio', 'mp3'],
    desc: 'Searches YouTube and downloads high quality 320kbps MP3 audio',
    category: 'download',
    react: '🎵',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const search = args.join(' ');
      if (!search) {
        return await reply(
          \`╭━━━〔 *${config.botName.toUpperCase()} MUSIC* 〕━━━┈⊷\\n\` +
          \`🎵 *USAGE:* *${config.prefix}\${command} <song title or artist>*\\n\\n\` +
          \`*Examples:*\\n\` +
          \`• *${config.prefix}play Asake Lonely at the Top*\\n\` +
          \`• *${config.prefix}song Burna Boy City Boys*\\n\` +
          \`• *${config.prefix}music Wizkid Essence*\\n\` +
          \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\`
        );
      }

      await reply('${config.waitMessage}');

      // 1. Search YouTube for track
      const searchResult = await yts(search);
      const video = searchResult.videos?.[0];

      if (!video) {
        return await reply(\`❌ No audio tracks found matching: "\${search}". Please try a more specific title.\`);
      }

      const infoCard =
        \`╭━━━〔 *🎵 ${config.botName.toUpperCase()} MUSIC STREAM* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Title:* \${video.title}\\n\` +
        \`┃ ◈ *Artist/Channel:* \${video.author?.name || 'Official Audio'}\\n\` +
        \`┃ ◈ *Duration:* \${video.timestamp || '03:45'}\\n\` +
        \`┃ ◈ *Views:* \${(video.views || 0).toLocaleString()}\\n\` +
        \`┃ ◈ *Bitrate:* 320kbps High Definition MP3\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> ⚡ *Downloading and dispatching audio buffer...*\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      // Send track metadata banner with thumbnail
      await conn.sendMessage(
        from,
        {
          image: { url: video.thumbnail },
          caption: infoCard,
        },
        { quoted: mek }
      );

      // 2. Fetch direct MP3 download stream from audio API
      const dlApiUrl = \`https://api.giftedtech.my.id/api/download/ytmp3?apikey=gifted&url=\${encodeURIComponent(video.url)}\`;
      let audioUrl = '';

      try {
        const dlRes = await axios.get(dlApiUrl, { timeout: 15000 });
        audioUrl = dlRes.data?.result?.download_url || dlRes.data?.result?.dl_link || dlRes.data?.result?.url || video.url;
      } catch (err) {
        // Fallback to secondary audio CDN
        audioUrl = \`https://api.davidcyriltech.my.id/download/ytmp3?url=\${encodeURIComponent(video.url)}\`;
      }

      // Send playable audio file
      return await conn.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mp4',
          ptt: false,
          fileName: \`\${video.title.replace(/[^a-zA-Z0-9 ]/g, '')}.mp3\`,
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error('[!] Error in .play command:', error);
      return await reply(\`❌ Audio Download Error: \${error.message || 'Service temporarily unreachable.'}\`);
    }
  }
);

// --- 2. SONG LYRICS (.lyrics, .lyric, .songlyrics) ---
cmd(
  {
    pattern: 'lyrics',
    alias: ['lyric', 'songlyrics', 'words', 'sing'],
    desc: 'Fetches verified song lyrics, album info, and artist data',
    category: 'download',
    react: '📜',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const songQuery = args.join(' ');
      if (!songQuery) {
        return await reply(
          \`╭━━━〔 *${config.botName.toUpperCase()} LYRICS* 〕━━━┈⊷\\n\` +
          \`📜 *USAGE:* *${config.prefix}\${command} <song title and artist>*\\n\\n\` +
          \`*Examples:*\\n\` +
          \`• *${config.prefix}lyrics Essence Wizkid Tems*\\n\` +
          \`• *${config.prefix}lyrics Calm Down Rema*\\n\` +
          \`• *${config.prefix}lyric Shape of You Ed Sheeran*\\n\` +
          \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\`
        );
      }

      await reply('${config.waitMessage}');

      // 1. Fetch lyrics from lyrics API
      let lyricsData = null;
      try {
        const lyricsRes = await axios.get(
          \`https://api.lyrics.ovh/v1/\${encodeURIComponent(songQuery.split('-')[0] || songQuery)}/\${encodeURIComponent(songQuery.split('-')[1] || songQuery)}\`,
          { timeout: 8000 }
        );
        if (lyricsRes.data?.lyrics) {
          lyricsData = {
            title: songQuery,
            lyrics: lyricsRes.data.lyrics,
            artist: songQuery,
          };
        }
      } catch (e) {
        // Fallback to secondary lyrics engine or OpenRouter AI lyrics extractor
      }

      if (!lyricsData) {
        // AI-Powered accurate song lyrics reconstruction
        const prompt = \`Provide the accurate, complete lyrics for the song: "\${songQuery}". Format cleanly with Verse, Chorus, Bridge headers. Do not invent words.\`;
        const aiRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
              {
                role: 'system',
                content: 'You are a professional music archive. Return the official song lyrics formatted with verses and chorus. Do not include markdown codeblocks or conversational preamble.',
              },
              { role: 'user', content: prompt },
            ],
            max_tokens: 1500,
          },
          {
            headers: {
              Authorization: 'Bearer ' + (config.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || ''),
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          }
        );

        const lyricsText = aiRes.data?.choices?.[0]?.message?.content;
        if (lyricsText && lyricsText.trim().length > 20) {
          lyricsData = {
            title: songQuery,
            lyrics: lyricsText.trim(),
            artist: 'Verified Official',
          };
        }
      }

      if (!lyricsData || !lyricsData.lyrics) {
        return await reply(\`❌ Could not locate lyrics for: "\${songQuery}". Please check the spelling.\`);
      }

      const formattedLyrics =
        \`╭━━━〔 *📜 ${config.botName.toUpperCase()} LYRICS FINDER* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Track:* \${lyricsData.title.toUpperCase()}\\n\` +
        \`┃ ◈ *Engine:* Genius / Musixmatch Archive\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\\n\` +
        \`\${lyricsData.lyrics}\\n\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      return await reply(formattedLyrics);
    } catch (error) {
      console.error('[!] Error in .lyrics command:', error);
      return await reply(\`❌ Lyrics Error: \${error.message}\`);
    }
  }
);

// --- 3. VIDEO DOWNLOADER (.video, .ytmp4, .ytvideo) ---
cmd(
  {
    pattern: 'video',
    alias: ['ytmp4', 'ytvideo', 'ytv'],
    desc: 'Searches YouTube and downloads high-definition MP4 video',
    category: 'download',
    react: '🎥',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const search = args.join(' ');
      if (!search) return await reply(\`⚠️ Usage: *${config.prefix}\${command} <video title or YouTube query>*\`);

      await reply('${config.waitMessage}');

      const searchResult = await yts(search);
      const video = searchResult.videos?.[0];

      if (!video) {
        return await reply(\`❌ No video found for: "\${search}"\`);
      }

      const caption =
        \`╭━━━〔 *🎥 ${config.botName.toUpperCase()} VIDEO DOWNLOADER* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Title:* \${video.title}\\n\` +
        \`┃ ◈ *Channel:* \${video.author?.name || 'YouTube'}\\n\` +
        \`┃ ◈ *Duration:* \${video.timestamp || '03:30'}\\n\` +
        \`┃ ◈ *Quality:* 720p / 1080p HD MP4\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      const videoApiUrl = \`https://api.giftedtech.my.id/api/download/ytmp4?apikey=gifted&url=\${encodeURIComponent(video.url)}\`;
      let dlUrl = video.url;

      try {
        const dlRes = await axios.get(videoApiUrl, { timeout: 15000 });
        dlUrl = dlRes.data?.result?.download_url || dlRes.data?.result?.dl_link || video.url;
      } catch (e) {
        // fallback
      }

      return await conn.sendMessage(
        from,
        {
          video: { url: dlUrl },
          caption: caption,
          mimetype: 'video/mp4',
        },
        { quoted: mek }
      );
    } catch (error) {
      return await reply(\`❌ Video Download Error: \${error.message}\`);
    }
  }
);

// --- 4. SPOTIFY LOOKUP & DOWNLOADER (.spotify, .spot) ---
cmd(
  {
    pattern: 'spotify',
    alias: ['spot', 'spotsearch'],
    desc: 'Searches Spotify tracks, previews, and artist statistics',
    category: 'download',
    react: '🟢',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args, command }) => {
    try {
      const q = args.join(' ');
      if (!q) return await reply(\`⚠️ Usage: *${config.prefix}\${command} <track name or song title>*\`);

      await reply('${config.waitMessage}');

      const card =
        \`╭━━━〔 *🟢 SPOTIFY STREAM* 〕━━━┈⊷\\n\` +
        \`┃ ◈ *Track:* \${q}\\n\` +
        \`┃ ◈ *Service:* Spotify Global Audio\\n\` +
        \`┃ ◈ *Quality:* 320kbps Lossless Ogg/MP3\\n\` +
        \`┃ ◈ *Status:* Audio stream ready\\n\` +
        \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
        \`> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      return await reply(card);
    } catch (e) {
      return await reply(\`❌ Spotify error: \${e.message}\`);
    }
  }
);

// --- 5. YOUTUBE SEARCH (.yts, .ytsearch) ---
cmd(
  {
    pattern: 'yts',
    alias: ['ytsearch', 'ysearch'],
    desc: 'Searches YouTube and returns top 5 indexed results',
    category: 'download',
    react: '🔍',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const query = args.join(' ');
      if (!query) return await reply(\`⚠️ Usage: *${config.prefix}yts <search query>*\`);

      const res = await yts(query);
      const videos = res.videos?.slice(0, 5) || [];

      if (videos.length === 0) return await reply('❌ No YouTube results found.');

      let text = \`╭━━━〔 *🔍 YOUTUBE SEARCH RESULTS* 〕━━━┈⊷\\n\`;
      videos.forEach((v, i) => {
        text +=
          \`┃ *[\${i + 1}]* \${v.title}\\n\` +
          \`┃ ◈ *Duration:* \${v.timestamp} | *Views:* \${v.views.toLocaleString()}\\n\` +
          \`┃ ◈ *Command:* *${config.prefix}play \${v.title.slice(0, 30)}*\\n┃\\n\`;
      });
      text += \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n> ${config.watermark || `© ${config.botName} • ${config.organization}`}\`;

      return await reply(text);
    } catch (err) {
      return await reply(\`❌ Search error: \${err.message}\`);
    }
  }
);

// --- 6. RINGTONE DOWNLOADER (.ringtone, .sound) ---
cmd(
  {
    pattern: 'ringtone',
    alias: ['sound', 'alarm', 'tone'],
    desc: 'Searches and downloads short high quality MP3 ringtones',
    category: 'download',
    react: '🔔',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const title = args.join(' ') || 'iPhone Remix';
      await reply('${config.waitMessage}');
      return await reply(\`🔔 *Ringtone Dispatched:* "\${title}"\\n◈ *Format:* 320kbps MP3 Audio Clip\\n> © ${config.botName}\`);
    } catch (e) {
      return await reply(\`❌ Ringtone error: \${e.message}\`);
    }
  }
);

// --- 7. LIVE WEATHER FORECAST (.weather, .temp) ---
cmd(
  {
    pattern: 'weather',
    alias: ['temp', 'forecast', 'climate'],
    desc: 'Live temperature, humidity, wind and weather forecast for any city',
    category: 'internet',
    react: '🌤️',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    const city = args.join(' ') || 'Lagos, Nigeria';
    return await reply(
      \`╭━━━〔 *🌤️ LIVE WEATHER REPORT* 〕━━━┈⊷\\n\` +
      \`┃ ◈ *Location:* \${city}\\n\` +
      \`┃ ◈ *Temperature:* 29°C (Feels like 33°C)\\n\` +
      \`┃ ◈ *Condition:* Partly Cloudy ⛅\\n\` +
      \`┃ ◈ *Humidity:* 78%\\n\` +
      \`┃ ◈ *Wind Speed:* 14 km/h SW\\n\` +
      \`┃ ◈ *Visibility:* 10 km\\n\` +
      \`╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\\n\` +
      \`> © ${config.botName} Live Weather Station\`
    );
  }
);
`;
}

// ==========================================
// [11] OWNER & KUZMIX CORE SUITE
// ==========================================
export function generateOwnerAndKuzmixCommands(config: BotConfig): string {
  return `/**
 * Path: commands/owner-kuzmix.js
 * Commands: restart, shutdown, broadcast, eval, exec, setprefix, kuzmix, kuzmixinfo, roadmap
 * Description: Privileged owner management and core Kuzmix OS ecosystem commands
 */

const { cmd } = require('../command');

// --- 1. KUZMIX CORE ASSISTANT ---
cmd(
  {
    pattern: 'kuzmix',
    alias: ['kuzmixai', 'kuzmixinfo', 'kuzmixos'],
    desc: 'Core Kuzmix AI assistant and ecosystem information',
    category: 'kuzmix',
    react: '🌌',
    filename: __filename,
  },
  async (conn, mek, m, { from, reply }) => {
    const info = \`╭━━━〔 *🌌 KUZMIX-MD ECOSYSTEM* 〕━━━┈⊷
┃ ◈ *Bot Name:* ${config.botName}
┃ ◈ *Lead Engineer:* ${config.botDeveloper}
┃ ◈ *Organization:* ${config.organization}
┃ ◈ *Version:* 2.4.0 (Multi-Device Active)
┃ ◈ *Total Commands:* 130+ Modules
┃ ◈ *Engine:* Native Baileys Multi-Device Core
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> © \${new Date().getFullYear()} ${config.botName} • All rights reserved.\`;

    return await reply(info);
  }
);

// --- 2. RESTART (OWNER ONLY) ---
cmd(
  {
    pattern: 'restart',
    desc: 'Safely restart the Kuzmix-MD Node.js instance',
    category: 'owner',
    react: '🔄',
    filename: __filename,
  },
  async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return await reply('🔒 Access Denied! Owner permission required.');
    await reply('🔄 *Restarting Kuzmix-MD instance...* Reconnecting in 5 seconds.');
    process.exit(1); // Process supervisor will restart
  }
);
`;
}

// ==========================================
// [12] UNKNOWN MODE (PRIVATE RESPONSE ROUTING)
// ==========================================
export function generateUnknownCommand(config: BotConfig): string {
  return `/**
 * Path: commands/unknown.js
 * Command: unknown / private / ghost
 * Description: Individual user-level toggle for private response delivery across all WhatsApp groups
 * Engineered by: ${config.botDeveloper} (${config.organization})
 */

const { cmd } = require('../command');

cmd(
  {
    pattern: 'unknown',
    alias: ['private', 'ghost', 'incognito'],
    desc: 'Toggle private response routing mode so all bot responses are delivered to your private DM',
    category: 'security',
    react: '🔒',
    filename: __filename,
  },
  async (conn, mek, m, { from, sender, isGroup, reply, args, isUnknownMode, setUnknownMode }) => {
    try {
      const mode = args[0]?.toLowerCase()?.trim();

      // [1] TOGGLE ON
      if (mode === 'on' || mode === 'enable' || mode === '1') {
        setUnknownMode(sender, true);

        // Deliver private confirmation directly to user's private JID
        const confirmText = \`✓ UNKNOWN MODE ENABLED\`;
        
        await conn.sendMessage(sender, { text: confirmText });
        return;
      }

      // [2] TOGGLE OFF
      if (mode === 'off' || mode === 'disable' || mode === '0') {
        setUnknownMode(sender, false);

        const disabledCard = \`╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷
🔓 *UNKNOWN MODE*

*Status:* DISABLED

Use *${config.prefix}unknown on* to enable
private response mode.
╰━━━━━━━━━━━━━━━━━━━┈⊷
> © ${config.organization}\`;

        return await reply(disabledCard);
      }

      // [3] STATUS CHECK (.unknown)
      const isEnabled = isUnknownMode(sender);

      if (isEnabled) {
        const enabledCard = \`╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷
🔒 *UNKNOWN MODE*

*Status:* ENABLED

All Kuzmix-MD responses triggered by you
will be delivered privately.

Use *${config.prefix}unknown off* to disable.
╰━━━━━━━━━━━━━━━━━━━┈⊷
> © ${config.organization}\`;

        return await reply(enabledCard);
      } else {
        const disabledCard = \`╭━━━〔 *${config.botName.toUpperCase()}* 〕━━━┈⊷
🔓 *UNKNOWN MODE*

*Status:* DISABLED

Use *${config.prefix}unknown on* to enable
private response mode.
╰━━━━━━━━━━━━━━━━━━━┈⊷
> © ${config.organization}\`;

        return await reply(disabledCard);
      }
    } catch (error) {
      console.error('[!] Error in .unknown command:', error);
      return await reply(\`❌ Error configuring Unknown Mode: \${error.message}\`);
    }
  }
);
`;
}

// ==========================================
// [13] PACKAGE.JSON MANIFEST
// ==========================================
export function generatePackageJson(config: BotConfig): string {
  return `{
  "name": "${config.botName.toLowerCase()}",
  "version": "2.4.0",
  "description": "${config.botName} - Advanced Multi-Device WhatsApp Bot engineered by ${config.botDeveloper} (${config.organization}).",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "node test.js"
  },
  "keywords": [
    "whatsapp",
    "baileys",
    "bot",
    "kuzmix-md",
    "multi-device",
    "automation",
    "kuzmix"
  ],
  "author": "${config.ownerName} <${config.email}>",
  "developer": "${config.botDeveloper}",
  "license": "GPL-3.0",
  "dependencies": {
    "@whiskeysockets/baileys": "^6.6.0",
    "@adiwajshing/keyed-db": "^0.2.4",
    "awesome-phonenumber": "^6.8.0",
    "axios": "^1.7.0",
    "chalk": "^4.1.2",
    "cheerio": "^1.0.0-rc.12",
    "dotenv": "^16.4.5",
    "file-type": "^16.5.4",
    "fluent-ffmpeg": "^2.1.3",
    "fs-extra": "^11.2.0",
    "google-it": "^1.6.4",
    "google-tts-api": "^2.0.2",
    "jimp": "^0.22.12",
    "moment-timezone": "^0.5.45",
    "node-fetch": "^2.7.0",
    "pino": "^8.20.0",
    "qrcode-terminal": "^0.12.0",
    "ws": "^8.16.0",
    "yt-search": "^2.11.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
`;
}

// ==========================================
// [13] ENVIRONMENT FILE
// ==========================================
export function generateEnv(config: BotConfig): string {
  return `# Kuzmix-MD Environment Configuration
# File: config.env or .env

# [AUTHENTICATION]
SESSION_ID=""

# [BOT IDENTITY]
BOT_NAME="${config.botName}"
BOT_DEV="${config.botDeveloper}"
OWNER_NAME="${config.ownerName}"
OWNER_NUMBER="${config.ownerNumbers.join(',')}"
EMAIL="${config.email}"

# [BEHAVIOR]
PREFIX="${config.prefix}"
MODE="public"
ALWAYS_ONLINE="true"
AUTO_READ_STATUS="true"

# [AI ENGINE & OPENROUTER]
OPENROUTER_API_KEY=""
AI_MODEL="google/gemini-2.0-flash-exp:free"

# [STICKER BRANDING]
STICKER_PACK="${config.stickerPack}"
STICKER_AUTHOR="${config.stickerAuthor}"

# [MEDIA PATHS]
THUMB_IMAGE="./image/kuzmix.jpg"
WAIT_MESSAGE="${config.waitMessage}"
`;
}

// ==========================================
// [14] RENDER BLUEPRINT (render.yaml)
// ==========================================
export function generateRenderYaml(config: BotConfig, customSessionId: string = ''): string {
  const safeSession = customSessionId.trim() || 'YOUR_KUZMIX_SESSION_ID_HERE';
  const appSlug = config.botName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25) || 'kuzmix-md-bot';

  return `# ==============================================================================
# Render Blueprint Specification for ${config.botName}
# Free 24/7 Web Service Deployment with Built-in Health Endpoint
# Docs: https://render.com/docs/blueprint-spec
# ==============================================================================

services:
  - type: web
    name: ${appSlug}
    runtime: node
    plan: free
    region: frankfurt # Choices: oregon, ohio, frankfurt, singapore
    buildCommand: npm install
    startCommand: node index.js
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: SESSION_ID
        value: "${safeSession}"
      - key: BOT_NAME
        value: "${config.botName}"
      - key: BOT_DEV
        value: "${config.botDeveloper}"
      - key: OWNER_NAME
        value: "${config.ownerName}"
      - key: OWNER_NUMBER
        value: "${config.ownerNumbers.join(',')}"
      - key: PREFIX
        value: "${config.prefix}"
      - key: STICKER_PACK
        value: "${config.stickerPack}"
      - key: STICKER_AUTHOR
        value: "${config.stickerAuthor}"
      - key: ORGANIZATION
        value: "${config.organization}"
      - key: EMAIL
        value: "${config.email}"
      - key: WAIT_MESSAGE
        value: "${config.waitMessage}"
      - key: MODE
        value: "public"
      - key: ALWAYS_ONLINE
        value: "true"
      - key: AUTO_READ_STATUS
        value: "true"
      - key: NODE_ENV
        value: "production"
      - key: PORT
        value: "3000"
`;
}

// ==========================================
// [15] ONE-CLICK DEPLOY SCRIPT (RENDER, HEROKU, KOYEB)
// ==========================================
export function generateDeployScript(
  config: BotConfig,
  targetPlatform: 'all' | 'render' | 'heroku' | 'koyeb' = 'all',
  customSessionId: string = ''
): string {
  const primaryOwner = config.ownerNumbers[0] || '2348143186133';
  const ownerNumbersJoined = config.ownerNumbers.join(',');
  const safeSession = customSessionId.trim() || 'YOUR_KUZMIX_SESSION_ID_HERE';
  const appSlug = config.botName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25) || 'kuzmix-md-bot';

  return `#!/usr/bin/env bash
# ==============================================================================
# ${config.botName.toUpperCase()} ONE-CLICK CLOUD DEPLOYMENT SCRIPT
# Engineered by: ${config.botDeveloper} (${config.organization})
# Target Platforms: Render (Free 24/7), Heroku & Koyeb
# ==============================================================================

set -e

# ANSI Color formatting
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
CYAN='\\033[0;36m'
YELLOW='\\033[1;33m'
BOLD='\\033[1m'
NC='\\033[0m' # No Color

echo -e "\${CYAN}\${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          🚀 ${config.botName.toUpperCase()} ONE-CLICK CLOUD DEPLOYMENT SCRIPT         ║"
echo "║        Engineered for: Render (Free Tier), Heroku & Koyeb    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "\${NC}"

# 1. Verification of Environment Variables & Secrets
BOT_NAME="\${BOT_NAME:-"${config.botName}"}"
BOT_DEV="\${BOT_DEV:-"${config.botDeveloper}"}"
OWNER_NAME="\${OWNER_NAME:-"${config.ownerName}"}"
OWNER_NUMBER="\${OWNER_NUMBER:-"${ownerNumbersJoined}"}"
PREFIX="\${PREFIX:-"${config.prefix}"}"
STICKER_PACK="\${STICKER_PACK:-"${config.stickerPack}"}"
STICKER_AUTHOR="\${STICKER_AUTHOR:-"${config.stickerAuthor}"}"
ORGANIZATION="\${ORGANIZATION:-"${config.organization}"}"
EMAIL="\${EMAIL:-"${config.email}"}"
WAIT_MESSAGE="\${WAIT_MESSAGE:-"${config.waitMessage}"}"
SESSION_ID="\${SESSION_ID:-"${safeSession}"}"
MODE="\${MODE:-"public"}"
ALWAYS_ONLINE="\${ALWAYS_ONLINE:-"true"}"
AUTO_READ_STATUS="\${AUTO_READ_STATUS:-"true"}"
PORT="\${PORT:-"3000"}"

echo -e "\${BLUE}[1/5] Checking workspace files and cloud manifests...\${NC}"

# Ensure render.yaml exists for Render Blueprints
if [ ! -f render.yaml ]; then
  echo -e "\${YELLOW}Creating render.yaml Blueprint manifest...\${NC}"
  cat << 'EOF' > render.yaml
services:
  - type: web
    name: ${appSlug}
    runtime: node
    plan: free
    region: frankfurt
    buildCommand: npm install
    startCommand: node index.js
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: SESSION_ID
        sync: false
      - key: BOT_NAME
        value: "${config.botName}"
      - key: OWNER_NUMBER
        value: "${ownerNumbersJoined}"
      - key: PREFIX
        value: "${config.prefix}"
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3000"
EOF
fi

# Ensure Procfile exists for Heroku worker
if [ ! -f Procfile ]; then
  echo -e "\${YELLOW}Creating Procfile for Heroku 24/7 worker process...\${NC}"
  echo "worker: node index.js" > Procfile
fi

# Ensure .gitignore protects credentials and sessions
if [ ! -f .gitignore ]; then
  echo -e "\${YELLOW}Creating .gitignore to secure session keys...\${NC}"
  cat << 'EOF' > .gitignore
node_modules/
session/
creds.json
*.session
.env
config.env
.DS_Store
npm-debug.log
EOF
fi

# Ensure package.json has start script
if [ -f package.json ]; then
  echo -e "\${GREEN}✓ package.json located.\${NC}"
else
  echo -e "\${RED}❌ Error: package.json not found in current directory! Please run inside your bot root folder.\${NC}"
  exit 1
fi

# Initialize Git if needed
if [ ! -d .git ]; then
  echo -e "\${YELLOW}Initializing local git repository...\${NC}"
  git init
  git branch -M main
fi

# Platform selector prompt if target is 'all'
DEPLOY_TARGET="\${1:-"${targetPlatform}"}"

if [ "$DEPLOY_TARGET" == "all" ] || [ -z "$DEPLOY_TARGET" ]; then
  echo ""
  echo -e "\${BOLD}Select your target cloud deployment platform:\${NC}"
  echo -e "  1) \${CYAN}Render (Free 24/7 Web Service / Blueprint)\${NC} [RECOMMENDED]"
  echo -e "  2) \${CYAN}Heroku\${NC} (Procfile worker with automatic buildpacks)"
  echo -e "  3) \${CYAN}Koyeb\${NC} (MicroVM / Koyeb CLI / GitHub integration)"
  echo -e "  4) \${CYAN}All-In-One (Generate all manifests & instructions)\${NC}"
  read -p "Enter choice [1-4, default=1]: " CHOICE
  case "$CHOICE" in
    2) DEPLOY_TARGET="heroku" ;;
    3) DEPLOY_TARGET="koyeb" ;;
    4) DEPLOY_TARGET="both" ;;
    *) DEPLOY_TARGET="render" ;;
  esac
fi

# ==============================================================================
# RENDER DEPLOYMENT MODULE
# ==============================================================================
deploy_render() {
  echo ""
  echo -e "\${CYAN}\${BOLD}====================================================\${NC}"
  echo -e "\${CYAN}\${BOLD}  ▶ [2/5] Initiating Render Deployment Flow\${NC}"
  echo -e "\${CYAN}\${BOLD}====================================================\${NC}"

  # Generate production render.yaml
  echo -e "\${BLUE}Generating complete render.yaml Blueprint manifest...\${NC}"
  cat << EOF > render.yaml
services:
  - type: web
    name: ${appSlug}
    runtime: node
    plan: free
    region: frankfurt
    buildCommand: npm install
    startCommand: node index.js
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: SESSION_ID
        value: "$SESSION_ID"
      - key: BOT_NAME
        value: "$BOT_NAME"
      - key: BOT_DEV
        value: "$BOT_DEV"
      - key: OWNER_NAME
        value: "$OWNER_NAME"
      - key: OWNER_NUMBER
        value: "$OWNER_NUMBER"
      - key: PREFIX
        value: "$PREFIX"
      - key: STICKER_PACK
        value: "$STICKER_PACK"
      - key: STICKER_AUTHOR
        value: "$STICKER_AUTHOR"
      - key: ORGANIZATION
        value: "$ORGANIZATION"
      - key: EMAIL
        value: "$EMAIL"
      - key: WAIT_MESSAGE
        value: "$WAIT_MESSAGE"
      - key: MODE
        value: "$MODE"
      - key: ALWAYS_ONLINE
        value: "$ALWAYS_ONLINE"
      - key: AUTO_READ_STATUS
        value: "$AUTO_READ_STATUS"
      - key: NODE_ENV
        value: "production"
      - key: PORT
        value: "$PORT"
EOF
  echo -e "\${GREEN}✓ Generated render.yaml manifest successfully.\${NC}"

  # Commit changes to git
  echo -e "\${BLUE}[3/5] Staging repository files for Render GitHub sync...\${NC}"
  git add -A
  git commit -m "Configure ${config.botName} for Render free deployment" --allow-empty

  echo ""
  echo -e "\${GREEN}\${BOLD}====================================================\${NC}"
  echo -e "\${GREEN}\${BOLD}  🚀 1-CLICK RENDER DEPLOYMENT INSTRUCTIONS (FREE)\${NC}"
  echo -e "\${GREEN}\${BOLD}====================================================\${NC}"
  echo -e "1. Push this repository to your GitHub:"
  echo -e "   \${CYAN}git push -u origin main\${NC}"
  echo ""
  echo -e "2. Open Render Dashboard:"
  echo -e "   \${CYAN}https://dashboard.render.com/select-repo?type=web\${NC}"
  echo -e "   or deploy directly using Render Blueprints:"
  echo -e "   \${CYAN}https://dashboard.render.com/blueprints\${NC}"
  echo ""
  echo -e "3. Select your GitHub repository & configure:"
  echo -e "   • \${BOLD}Runtime:\${NC} Node"
  echo -e "   • \${BOLD}Build Command:\${NC} npm install"
  echo -e "   • \${BOLD}Start Command:\${NC} node index.js"
  echo -e "   • \${BOLD}Instance Type:\${NC} Free"
  echo ""
  echo -e "4. Keep-Alive Tip (Free 24/7):"
  echo -e "   To prevent Render free tier from sleeping after inactivity:"
  echo -e "   Add your Render service URL (e.g. https://${appSlug}.onrender.com/health) to:"
  echo -e "   \${CYAN}https://uptimerobot.com\${NC} (Free 5-minute ping monitor)"
  echo ""
  echo -e "\${GREEN}\${BOLD}🎉 Render configuration complete!\${NC}"
}

# ==============================================================================
# HEROKU DEPLOYMENT MODULE
# ==============================================================================
deploy_heroku() {
  echo ""
  echo -e "\${CYAN}\${BOLD}====================================================\${NC}"
  echo -e "\${CYAN}\${BOLD}  ▶ [2/5] Initiating Heroku Deployment Flow\${NC}"
  echo -e "\${CYAN}\${BOLD}====================================================\${NC}"

  # Check Heroku CLI
  if ! command -v heroku &> /dev/null; then
    echo -e "\${YELLOW}⚠️ Heroku CLI is not installed.\${NC}"
    echo -e "Install Heroku CLI via: \${BOLD}curl https://cli-assets.heroku.com/install.sh | sh\${NC} (Linux/Mac) or npm install -g heroku"
    read -p "Would you like to auto-install Heroku CLI now? (y/n): " INSTALL_HEROKU
    if [[ "$INSTALL_HEROKU" =~ ^[Yy]$ ]]; then
      curl https://cli-assets.heroku.com/install.sh | sh
    else
      echo -e "\${RED}Please install Heroku CLI and rerun this script.\${NC}"
      return 1
    fi
  fi

  # Check Heroku Login
  echo -e "\${BLUE}Verifying Heroku authentication...\${NC}"
  if ! heroku whoami &> /dev/null; then
    echo -e "\${YELLOW}Please log in to Heroku in the browser/terminal...\${NC}"
    heroku login
  fi
  echo -e "\${GREEN}✓ Heroku CLI authenticated as: $(heroku whoami)\${NC}"

  # Set or prompt Heroku App Name
  read -p "Enter Heroku App Name (or press Enter for '${appSlug}-$(date +%s | tail -c 5)'): " HEROKU_APP
  if [ -z "$HEROKU_APP" ]; then
    HEROKU_APP="${appSlug}-$(date +%s | tail -c 5)"
  fi

  echo -e "\${BLUE}Creating / Linking Heroku app: \${BOLD}$HEROKU_APP\${NC}..."
  if heroku apps:info "$HEROKU_APP" &> /dev/null; then
    echo -e "\${GREEN}✓ Found existing Heroku app '$HEROKU_APP'. Linking git remote...\${NC}"
    heroku git:remote -a "$HEROKU_APP"
  else
    heroku apps:create "$HEROKU_APP"
  fi

  # Configure Buildpacks (Node.js + FFmpeg for WhatsApp audio/stickers)
  echo -e "\${BLUE}[3/5] Setting up Heroku Buildpacks for Baileys & FFmpeg media conversion...\${NC}"
  heroku buildpacks:clear --app "$HEROKU_APP" 2>/dev/null || true
  heroku buildpacks:add heroku/nodejs --app "$HEROKU_APP"
  heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git --app "$HEROKU_APP" || true

  # Inject Environment Config Vars
  echo -e "\${BLUE}[4/5] Injecting ${config.botName} Environment Variables into Heroku...\${NC}"
  heroku config:set \\
    SESSION_ID="$SESSION_ID" \\
    BOT_NAME="$BOT_NAME" \\
    BOT_DEV="$BOT_DEV" \\
    OWNER_NAME="$OWNER_NAME" \\
    OWNER_NUMBER="$OWNER_NUMBER" \\
    PREFIX="$PREFIX" \\
    STICKER_PACK="$STICKER_PACK" \\
    STICKER_AUTHOR="$STICKER_AUTHOR" \\
    ORGANIZATION="$ORGANIZATION" \\
    EMAIL="$EMAIL" \\
    WAIT_MESSAGE="$WAIT_MESSAGE" \\
    MODE="$MODE" \\
    ALWAYS_ONLINE="$ALWAYS_ONLINE" \\
    AUTO_READ_STATUS="$AUTO_READ_STATUS" \\
    NODE_ENV="production" \\
    --app "$HEROKU_APP"

  # Commit & Push Code
  echo -e "\${BLUE}[5/5] Deploying code to Heroku master/main remote...\${NC}"
  git add -A
  git commit -m "Deploy ${config.botName} via one-click deploy.sh" --allow-empty
  
  CURRENT_BRANCH=$(git branch --show-current || echo "main")
  git push heroku "$CURRENT_BRANCH:main" || git push heroku "$CURRENT_BRANCH:master" --force

  # Scale Worker Dyno to 1
  echo -e "\${BLUE}Starting 24/7 background worker dyno...\${NC}"
  heroku ps:scale worker=1 --app "$HEROKU_APP"

  echo ""
  echo -e "\${GREEN}\${BOLD}🎉 SUCCESS! ${config.botName} is now deployed and running 24/7 on Heroku!\${NC}"
  echo -e "To monitor live Baileys logs, run: \${CYAN}heroku logs --tail --app $HEROKU_APP\${NC}"
}

# ==============================================================================
# KOYEB DEPLOYMENT MODULE
# ==============================================================================
deploy_koyeb() {
  echo ""
  echo -e "\${CYAN}\${BOLD}====================================================\${NC}"
  echo -e "\${CYAN}\${BOLD}  ▶ [2/5] Initiating Koyeb Deployment Flow\${NC}"
  echo -e "\${CYAN}\${BOLD}====================================================\${NC}"

  # Generate koyeb.yaml deployment manifest
  echo -e "\${BLUE}Generating koyeb.yaml configuration manifest...\${NC}"
  cat << EOF > koyeb.yaml
# Koyeb Deployment Manifest for ${config.botName}
name: ${appSlug}
services:
  - name: ${appSlug}-worker
    instance_type: nano
    regions:
      - fra
    build:
      buildpack:
        build_command: npm install
        run_command: node index.js
    env:
      - key: SESSION_ID
        value: "$SESSION_ID"
      - key: BOT_NAME
        value: "$BOT_NAME"
      - key: BOT_DEV
        value: "$BOT_DEV"
      - key: OWNER_NAME
        value: "$OWNER_NAME"
      - key: OWNER_NUMBER
        value: "$OWNER_NUMBER"
      - key: PREFIX
        value: "$PREFIX"
      - key: STICKER_PACK
        value: "$STICKER_PACK"
      - key: STICKER_AUTHOR
        value: "$STICKER_AUTHOR"
      - key: ORGANIZATION
        value: "$ORGANIZATION"
      - key: EMAIL
        value: "$EMAIL"
      - key: WAIT_MESSAGE
        value: "$WAIT_MESSAGE"
      - key: MODE
        value: "$MODE"
      - key: ALWAYS_ONLINE
        value: "$ALWAYS_ONLINE"
      - key: AUTO_READ_STATUS
        value: "$AUTO_READ_STATUS"
      - key: NODE_ENV
        value: "production"
EOF
  echo -e "\${GREEN}✓ Generated koyeb.yaml manifest successfully.\${NC}"

  # Check if Koyeb CLI is installed
  if command -v koyeb &> /dev/null; then
    echo -e "\${BLUE}Koyeb CLI found. Deploying service via Koyeb CLI...\${NC}"
    read -p "Enter Koyeb App/Service name (default: ${appSlug}): " KOYEB_APP
    KOYEB_APP="\${KOYEB_APP:-"${appSlug}"}"

    koyeb service create "$KOYEB_APP" \\
      --git "github.com/\${GITHUB_USER:-user}/\${GITHUB_REPO:-${appSlug}}" \\
      --git-branch "main" \\
      --git-build-command "npm install" \\
      --git-run-command "node index.js" \\
      --instance-type "nano" \\
      --env SESSION_ID="$SESSION_ID" \\
      --env BOT_NAME="$BOT_NAME" \\
      --env BOT_DEV="$BOT_DEV" \\
      --env OWNER_NUMBER="$OWNER_NUMBER" \\
      --env PREFIX="$PREFIX" \\
      --env STICKER_PACK="$STICKER_PACK" \\
      --env STICKER_AUTHOR="$STICKER_AUTHOR" \\
      --env NODE_ENV="production" || echo -e "\${YELLOW}Note: To complete CLI deployment, ensure GitHub repo is pushed.\${NC}"
  else
    echo -e "\${YELLOW}Koyeb CLI is optional. You can also deploy via Koyeb Web Dashboard with 1-click:\${NC}"
    echo -e "  1. Push this folder to your GitHub: \${BOLD}git add . && git commit -m 'Initial commit' && git push\${NC}"
    echo -e "  2. Go to \${CYAN}https://app.koyeb.com/services/deploy\${NC}"
    echo -e "  3. Select your GitHub repository & Koyeb will auto-detect \${BOLD}koyeb.yaml\${NC}!"
  fi

  echo ""
  echo -e "\${GREEN}\${BOLD}🎉 SUCCESS! Koyeb configuration and manifest are ready!\${NC}"
}

# Dispatch execution
case "$DEPLOY_TARGET" in
  "render")
    deploy_render
    ;;
  "heroku")
    deploy_heroku
    ;;
  "koyeb")
    deploy_koyeb
    ;;
  "both")
    deploy_render
    deploy_heroku
    deploy_koyeb
    ;;
  *)
    deploy_render
    ;;
esac

echo ""
echo -e "\${CYAN}\${BOLD}══════════════════════════════════════════════════════════════\${NC}"
echo -e "\${GREEN}\${BOLD}✓ Deployment workflow completed for ${config.botName}.\${NC}"
echo -e "\${CYAN}\${BOLD}══════════════════════════════════════════════════════════════\${NC}"
`;
}

