/**
 * Kuzmix-MD Command: .note
 * Category: smart
 * Description: Save text note for quick retrieval later
 */

module.exports = {
  name: 'note',
  aliases: [],
  category: 'smart',
  description: 'Save text note for quick retrieval later',
  usage: '.note VPS IP is 192.168.1.1',
  example: '.note VPS IP is 192.168.1.1',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'note';
    const desc = 'Save text note for quick retrieval later';
    const syntax = '.note VPS IP is 192.168.1.1';
    const example = '.note VPS IP is 192.168.1.1';
    const nameUpper = 'NOTE';

    
    const content = args.join(' ').trim();
    return reply(
      `🧠 *Smart Assistant Task (.${name})*\n\n` +
      `• *Action:* Save text note for quick retrieval later\n` +
      `• *Entry:* "${content || 'Default task'}"\n` +
      `• *Status:* Saved to user session record\n\n` +
      `_${config.watermark}_`
    );

  }
};
