/**
 * Kuzmix-MD Command: .github
 * Category: download
 * Description: Search GitHub repositories for libraries
 */

module.exports = {
  name: 'github',
  aliases: [],
  category: 'download',
  description: 'Search GitHub repositories for libraries',
  usage: '.github baileys multi device',
  example: '.github baileys multi device',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'github';
    const desc = 'Search GitHub repositories for libraries';
    const syntax = '.github baileys multi device';
    const example = '.github baileys multi device';
    const nameUpper = 'GITHUB';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Downloader & Package Search (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    
    try {
      const data = await getJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=3`);
      const items = data.items || [];
      if (items.length === 0) throw new Error('No repos found');
      let out = `╔═════『 *GITHUB REPOSITORY SEARCH* 』═════\n`;
      for (const repo of items) {
        out += `\n📁 *${repo.full_name}* (⭐ ${repo.stargazers_count})\n`;
        out += `📝 ${repo.description ? repo.description.slice(0, 60) + '...' : 'No description'}\n`;
        out += `🔗 ${repo.html_url}\n`;
      }
      out += `\n╚═══════════════════════════════════════\n\n_${config.watermark}_`;
      return reply(out);
    } catch (err) {
      return reply(`❌ *No GitHub repositories found for "${query}".*\n\n_${config.watermark}_`);
    }
    

  }
};
