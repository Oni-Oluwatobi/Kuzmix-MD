/**
 * Kuzmix-MD Command: .release
 * Category: kuzmix
 * Description: Show latest release notes and version download
 */

module.exports = {
  name: 'release',
  aliases: [],
  category: 'kuzmix',
  description: 'Show latest release notes and version download',
  usage: '.release',
  example: '.release',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'release';
    const desc = 'Show latest release notes and version download';
    const syntax = '.release';
    const example = '.release';
    const nameUpper = 'RELEASE';

    
    
    return reply(
      `╔═════『 *KUZMIX-MD RELEASE NOTES* 』═════\n` +
      `🚀 *Version:* v2.0.0 Stable\n` +
      `📅 *Date:* September 2026\n` +
      `⚡ *Changes:* 223 modular commands, Baileys v6.7.12, Direct WhatsApp notifications\n` +
      `╚══════════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
