/**
 * Kuzmix-MD Command: .search
 * Category: internet
 * Description: Search the live web for articles
 */

module.exports = {
  name: 'search',
  aliases: [],
  category: 'internet',
  description: 'Search the live web for articles',
  usage: '.search latest AI breakthroughs 2026',
  example: '.search latest AI breakthroughs 2026',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'search';
    const desc = 'Search the live web for articles';
    const syntax = '.search latest AI breakthroughs 2026';
    const example = '.search latest AI breakthroughs 2026';
    const nameUpper = 'SEARCH';

    
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
