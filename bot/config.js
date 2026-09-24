/**
 * Kuzmix-MD Bot Configuration
 * Developer: Oni Oluwatobi
 * Organization: The Kreadive Galaxy
 */

const path = require('path');
try {
  require('dotenv').config();
} catch (_) {}

function envBool(name, defaultVal) {
  const v = process.env[name];
  if (v === undefined || v === '') return defaultVal;
  return v === 'true' || v === '1' || v === 'yes';
}

const sessionDirectory = process.env.KUZMIX_AUTH_DIR || path.join(process.cwd(), 'session');
const sessionsRoot = path.join(sessionDirectory, 'sessions');

const config = {
  botName: process.env.BOT_NAME || 'Kuzmix-MD',
  developerName: process.env.BOT_DEVELOPER || 'Oni Oluwatobi',
  organization: process.env.ORGANIZATION || 'The Kreadive Galaxy',

  prefix: process.env.BOT_PREFIX || '.',
  owner: (process.env.OWNER_NUMBERS || '2348143186133,2349124846023')
    .split(',')
    .map(num => num.replace(/\D/g, ''))
    .filter(Boolean),

  mode: process.env.BOT_MODE || 'public',
  privateMode: envBool('PRIVATE_MODE', true),
  publicMode: envBool('PUBLIC_MODE', false),
  strictMode: envBool('STRICT_MODE', true),
  unknownCommandMode: process.env.UNKNOWN_MODE || 'silent',
  sessionDir: sessionDirectory,
  sessionsRoot,
  logLevel: process.env.LOG_LEVEL || 'silent',
  reconnectMaxRetries: 10,
  reconnectBaseDelayMs: 3000,
  watermark: process.env.BOT_WATERMARK || '⚡ Powered by Kuzmix-MD',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  generationMode: process.env.GENERATION_MODE || 'auto',
  videoBackend: process.env.VIDEO_BACKEND || 'huggingface',
  pollinationsApiKey: process.env.POLLINATIONS_API_KEY || '',
  groupInviteCode: process.env.GROUP_INVITE_CODE || 'IbvPjkzu0Rq69XgmwiAHMA',

  resetSafetyFlags() {
    this.privateMode = envBool('PRIVATE_MODE', true);
    this.publicMode = envBool('PUBLIC_MODE', false);
    this.strictMode = envBool('STRICT_MODE', true);
  },
};

module.exports = config;
