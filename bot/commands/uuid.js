/**
 * Kuzmix-MD Command: .uuid
 * Category: utilities
 * Description: Generate random RFC-4122 v4 UUID strings
 */

module.exports = {
  name: 'uuid',
  aliases: [],
  category: 'utilities',
  description: 'Generate random RFC-4122 v4 UUID strings',
  usage: '.uuid',
  example: '.uuid',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'uuid';
    const desc = 'Generate random RFC-4122 v4 UUID strings';
    const syntax = '.uuid';
    const example = '.uuid';
    const nameUpper = 'UUID';

    
    const input = args.join(' ').trim();
    
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    return reply(
      `╔═════『 *UUID v4 GENERATOR* 』═════\n` +
      `🆔 *ID:* \`${id}\`\n` +
      `╚══════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
