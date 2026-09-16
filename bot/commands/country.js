/**
 * Kuzmix-MD Command: .country
 * Category: internet
 * Description: Country capital, population, currency & flag
 */

module.exports = {
  name: 'country',
  aliases: [],
  category: 'internet',
  description: 'Country capital, population, currency & flag',
  usage: '.country Nigeria',
  example: '.country Nigeria',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'country';
    const desc = 'Country capital, population, currency & flag';
    const syntax = '.country Nigeria';
    const example = '.country Nigeria';
    const nameUpper = 'COUNTRY';

    
    const query = args.join(' ').trim();
    
    if (!query) return reply('🗺️ Please specify a country: \`' + config.prefix + 'country Nigeria\`');
    try {
      const data = await getJson(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`);
      const c = data[0];
      const capital = c.capital ? c.capital[0] : 'N/A';
      const pop = (c.population || 0).toLocaleString();
      const region = c.region || 'N/A';
      const flag = c.flag || '🏳️';
      return reply(
        `╔═════『 *${flag} ${c.name.common.toUpperCase()}* 』═════\n` +
        `🏛️ *Capital:* ${capital}\n` +
        `👥 *Population:* ${pop}\n` +
        `🌐 *Region:* ${region}\n` +
        `🗺️ *Subregion:* ${c.subregion || 'N/A'}\n` +
        `╚═══════════════════════════════════════\n\n` +
        `_${config.watermark}_`
      );
    } catch (err) {
      return reply(`❌ *Could not find information for country "${query}".*\n\n_${config.watermark}_`);
    }
    

  }
};
