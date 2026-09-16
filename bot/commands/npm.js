/**
 * Kuzmix-MD Command: .npm
 * Category: download
 * Description: Search npm registry for Node packages
 */

module.exports = {
  name: 'npm',
  aliases: [],
  category: 'download',
  description: 'Search npm registry for Node packages',
  usage: '.npm @whiskeysockets/baileys',
  example: '.npm @whiskeysockets/baileys',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'npm';
    const desc = 'Search npm registry for Node packages';
    const syntax = '.npm @whiskeysockets/baileys';
    const example = '.npm @whiskeysockets/baileys';
    const nameUpper = 'NPM';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Downloader & Package Search (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    
    try {
      const data = await getJson(`https://registry.npmjs.org/${encodeURIComponent(query)}`);
      const latest = data['dist-tags']?.latest;
      const verInfo = data.versions?.[latest];
      const desc = data.description || 'No description provided';
      const license = data.license || 'MIT';
      return reply(
        `╔═════『 *NPM REGISTRY SEARCH* 』═════\n` +
        `📦 *Package:* ${data.name}\n` +
        `🏷️ *Latest Version:* v${latest}\n` +
        `📝 *Description:* ${desc}\n` +
        `⚖️ *License:* ${license}\n` +
        `🔗 *NPM Link:* https://www.npmjs.com/package/${data.name}\n` +
        `╚═════════════════════════════════════\n\n` +
        `_${config.watermark}_`
      );
    } catch (err) {
      return reply(`❌ *Package "${query}" not found on NPM registry.*\n\n_${config.watermark}_`);
    }
    

  }
};
