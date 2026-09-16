/**
 * Kuzmix-MD Command: .password
 * Category: utilities
 * Description: Generate secure high-entropy password
 */

module.exports = {
  name: 'password',
  aliases: [],
  category: 'utilities',
  description: 'Generate secure high-entropy password',
  usage: '.password',
  example: '.password',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'password';
    const desc = 'Generate secure high-entropy password';
    const syntax = '.password';
    const example = '.password';
    const nameUpper = 'PASSWORD';

    
    const input = args.join(' ').trim();
    
    const length = parseInt(args[0]) || 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return reply(
      `╔═════『 *SECURE PASSWORD GENERATOR* 』═════\n` +
      `🔑 *Entropy:* High\n` +
      `📏 *Length:* ${length} characters\n` +
      `🛡️ *Password:* \`${pwd}\`\n` +
      `╚══════════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
