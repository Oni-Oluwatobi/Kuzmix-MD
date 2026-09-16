/**
 * Kuzmix-MD Command: .hash
 * Category: utilities
 * Description: Generate MD5, SHA-256 and SHA-512 hashes
 */

module.exports = {
  name: 'hash',
  aliases: [],
  category: 'utilities',
  description: 'Generate MD5, SHA-256 and SHA-512 hashes',
  usage: '.hash KuzmixBot2026',
  example: '.hash KuzmixBot2026',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'hash';
    const desc = 'Generate MD5, SHA-256 and SHA-512 hashes';
    const syntax = '.hash KuzmixBot2026';
    const example = '.hash KuzmixBot2026';
    const nameUpper = 'HASH';

    
    const input = args.join(' ').trim();
    
    const crypto = require('crypto');
    const target = input || 'Kuzmix-MD';
    const md5 = crypto.createHash('md5').update(target).digest('hex');
    const sha256 = crypto.createHash('sha256').update(target).digest('hex');
    return reply(
      `╔═════『 *CRYPTOGRAPHIC HASHES* 』═════\n` +
      `📝 *Input:* ${target}\n` +
      `🔒 *MD5:* ${md5}\n` +
      `🛡️ *SHA-256:* ${sha256}\n` +
      `╚══════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
