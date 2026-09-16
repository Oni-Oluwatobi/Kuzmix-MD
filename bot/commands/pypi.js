/**
 * Kuzmix-MD Command: .pypi
 * Category: download
 * Description: Search Python packages on PyPI
 */

module.exports = {
  name: 'pypi',
  aliases: [],
  category: 'download',
  description: 'Search Python packages on PyPI',
  usage: '.pypi fastapi',
  example: '.pypi fastapi',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'pypi';
    const desc = 'Search Python packages on PyPI';
    const syntax = '.pypi fastapi';
    const example = '.pypi fastapi';
    const nameUpper = 'PYPI';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Downloader & Package Search (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    
    try {
      const data = await getJson(`https://pypi.org/pypi/${encodeURIComponent(query)}/json`);
      const info = data.info;
      return reply(
        `╔═════『 *PYPI PACKAGE SEARCH* 』═════\n` +
        `🐍 *Package:* ${info.name}\n` +
        `🏷️ *Version:* v${info.version}\n` +
        `📝 *Summary:* ${info.summary || 'No summary'}\n` +
        `🔗 *PyPI URL:* ${info.project_url || info.package_url}\n` +
        `╚═════════════════════════════════════\n\n` +
        `_${config.watermark}_`
      );
    } catch (err) {
      return reply(`❌ *Python package "${query}" not found on PyPI.*\n\n_${config.watermark}_`);
    }
    

  }
};
