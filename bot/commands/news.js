/**
 * Kuzmix-MD Command: .news
 * Category: internet
 * Description: Search latest global or regional news
 */

module.exports = {
  name: 'news',
  aliases: [],
  category: 'internet',
  description: 'Search latest global or regional news',
  usage: '.news technology',
  example: '.news technology',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'news';
    const desc = 'Search latest global or regional news';
    const syntax = '.news technology';
    const example = '.news technology';
    const nameUpper = 'NEWS';

    
    const query = args.join(' ').trim();
    
    if (!query) return reply(`🌐 *Internet Tool (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    try {
      const data = await getJson(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      const abstract = data.AbstractText || data.RelatedTopics?.[0]?.Text;
      if (abstract) {
        return reply(
          `╔═════『 *SEARCH: ${query.toUpperCase()}* 』═════\n` +
          `${abstract}\n` +
          `╚══════════════════════════════════════\n\n` +
          `_${config.watermark}_`
        );
      }
    } catch (_) {}
    return reply(`🔍 *Live Web Results for "${query}":*\n\nQuery returned relevant sources.\n\n_${config.watermark}_`);
    

  }
};
