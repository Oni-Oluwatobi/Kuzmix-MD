/**
 * Kuzmix-MD Command: .credits
 * Category: system
 * Description: Show project credits
 */

module.exports = {
  name: 'credits',
  aliases: ["cred","developer"],
  category: 'system',
  description: 'Show project credits',
  usage: '.credits',
  example: '.credits',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'credits';
    const desc = 'Show project credits';
    const syntax = '.credits';
    const example = '.credits';
    const nameUpper = 'CREDITS';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    return reply(
      `🛡️ *Kuzmix-MD Official Credits*\n\n` +
      `• *Lead Architect & Developer:* ${config.developerName}\n` +
      `• *Organization:* ${config.organization}\n` +
      `• *Architecture:* WhatsApp Multi-Device Baileys Daemon\n` +
      `• *License:* MIT\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
