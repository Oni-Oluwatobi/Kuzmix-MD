/**
 * Kuzmix-MD Command: .gitclone
 * Category: download
 * Description: Download public GitHub repository as ZIP
 */

module.exports = {
  name: 'gitclone',
  aliases: [],
  category: 'download',
  description: 'Download public GitHub repository as ZIP',
  usage: '.gitclone https://github.com/thekreadivegalaxy/Kuzmix-MD',
  example: '.gitclone https://github.com/thekreadivegalaxy/Kuzmix-MD',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'gitclone';
    const desc = 'Download public GitHub repository as ZIP';
    const syntax = '.gitclone https://github.com/thekreadivegalaxy/Kuzmix-MD';
    const example = '.gitclone https://github.com/thekreadivegalaxy/Kuzmix-MD';
    const nameUpper = 'GITCLONE';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Downloader & Package Search (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    
    let cleanUrl = query;
    if (!cleanUrl.endsWith('.zip')) {
      cleanUrl = cleanUrl.replace(/\.git$/, '') + '/archive/refs/heads/main.zip';
    }
    return reply(
      `╔═════『 *GITHUB CLONE ARCHIVE* 』═════\n` +
      `📦 *Target Repository:* ${query}\n` +
      `📥 *Direct ZIP Download:* ${cleanUrl}\n` +
      `╚═════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
