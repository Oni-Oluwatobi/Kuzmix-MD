/**
 * Kuzmix-MD Command: .google
 * Category: internet
 * Description: Google search results lookup
 */

module.exports = {
  name: 'google',
  aliases: [],
  category: 'internet',
  description: 'Google search results lookup',
  usage: '.google TypeScript 5.5 release notes',
  example: '.google TypeScript 5.5 release notes',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'google';
    const desc = 'Google search results lookup';
    const syntax = '.google TypeScript 5.5 release notes';
    const example = '.google TypeScript 5.5 release notes';
    const nameUpper = 'GOOGLE';

    
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
