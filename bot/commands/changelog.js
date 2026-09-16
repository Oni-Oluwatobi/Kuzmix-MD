/**
 * Kuzmix-MD Command: .changelog
 * Category: system
 * Description: Show latest changes
 */

module.exports = {
  name: 'changelog',
  aliases: ["updates","changes"],
  category: 'system',
  description: 'Show latest changes',
  usage: '.changelog',
  example: '.changelog',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'changelog';
    const desc = 'Show latest changes';
    const syntax = '.changelog';
    const example = '.changelog';
    const nameUpper = 'CHANGELOG';

    
    const os = require('os');
    const uptimeSec = process.uptime();
    const d = Math.floor(uptimeSec / 86400);
    const h = Math.floor((uptimeSec % 86400) / 3600);
    const m = Math.floor((uptimeSec % 3600) / 60);
    const s = Math.floor(uptimeSec % 60);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    
    return reply(
      `📜 *Kuzmix-MD v2.0 Changelog*\n\n` +
      `• Multi-Module Restructuring (bot, admin-portal, pairing-portal)\n` +
      `• 18-Module Master Command Catalog with 223 verified commands\n` +
      `• Real Baileys 8-digit phone pairing with direct WhatsApp notifications\n` +
      `• AI Media Image generation & View-Once v1/v2 extraction\n` +
      `• Full group security, anti-link, anti-spam and moderation telemetry\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
