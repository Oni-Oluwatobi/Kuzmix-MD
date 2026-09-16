/**
 * Kuzmix-MD Command: .base64
 * Category: utilities
 * Description: Encode or decode text in Base64 format
 */

module.exports = {
  name: 'base64',
  aliases: [],
  category: 'utilities',
  description: 'Encode or decode text in Base64 format',
  usage: '.base64 encode Hello Kuzmix',
  example: '.base64 encode Hello Kuzmix',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'base64';
    const desc = 'Encode or decode text in Base64 format';
    const syntax = '.base64 encode Hello Kuzmix';
    const example = '.base64 encode Hello Kuzmix';
    const nameUpper = 'BASE64';

    
    const input = args.join(' ').trim();
    
    const mode = args[0]?.toLowerCase();
    const text = args.slice(1).join(' ');
    if (mode === 'decode') {
      const decoded = Buffer.from(text, 'base64').toString('utf-8');
      return reply(`🔓 *Base64 Decoded:*\n\`\`\`${decoded}\`\`\``);
    } else {
      const toEncode = mode === 'encode' ? text : input;
      const encoded = Buffer.from(toEncode).toString('base64');
      return reply(`🔒 *Base64 Encoded:*\n\`\`\`${encoded}\`\`\``);
    }
    

  }
};
