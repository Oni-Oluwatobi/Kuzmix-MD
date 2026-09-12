/**
 * Kuzmix-MD Bot Configuration
 * Developer: Oni Oluwatobi
 * Organization: The Kreadive Galaxy
 */

const path = require('path');
require('dotenv').config();

const sessionDirectory = process.env.KUZMIX_AUTH_DIR || path.join(process.cwd(), 'session');

module.exports = {
  botName: process.env.BOT_NAME || 'Kuzmix-MD',
  developerName: process.env.BOT_DEVELOPER || 'Oni Oluwatobi',
  organization: process.env.ORGANIZATION || 'The Kreadive Galaxy',

  prefix: process.env.BOT_PREFIX || '.',
  owner: (process.env.OWNER_NUMBERS || '2348143186133,2349124846023')
    .split(',')
    .map(num => num.replace(/\D/g, ''))
    .filter(Boolean),

  mode: process.env.BOT_MODE || 'public',
  unknownCommandMode: process.env.UNKNOWN_MODE || 'silent',
  sessionDir: sessionDirectory,
  logLevel: process.env.LOG_LEVEL || 'silent',
  reconnectMaxRetries: 10,
  reconnectBaseDelayMs: 3000,
  watermark: process.env.BOT_WATERMARK || '⚡ Powered by Kuzmix-MD | The Kreadive Galaxy',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};
