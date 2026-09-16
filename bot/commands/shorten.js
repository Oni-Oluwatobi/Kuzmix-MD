/**
 * Kuzmix-MD Command: .shorten
 * Category: internet
 * Description: Shorten long URLs to clean short links
 */

module.exports = {
  name: 'shorten',
  aliases: [],
  category: 'internet',
  description: 'Shorten long URLs to clean short links',
  usage: '.shorten https://long-url...',
  example: '.shorten https://long-url...',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'shorten';
    const desc = 'Shorten long URLs to clean short links';
    const syntax = '.shorten https://long-url...';
    const example = '.shorten https://long-url...';
    const nameUpper = 'SHORTEN';

    
    const query = args.join(' ').trim();
    
    if (!query) return reply('🔗 Please provide a URL to shorten: \`' + config.prefix + 'shorten https://...\`');
    try {
      const data = await getJson(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(query)}`);
      return reply(
        `╔═════『 *URL SHORTENER* 』═════\n` +
        `🔗 *Original:* ${query}\n` +
        `✂️ *Short Link:* ${data}\n` +
        `╚══════════════════════════════\n\n` +
        `_${config.watermark}_`
      );
    } catch (_) {
      return reply(`✂️ *Shortened Link:* https://tinyurl.com/api-create.php?url=${encodeURIComponent(query)}\n\n_${config.watermark}_`);
    }
    

  }
};
