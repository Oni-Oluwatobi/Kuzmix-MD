/**
 * Kuzmix-MD Command: .ytsearch
 * Category: download
 * Description: Search the YouTube video catalog and return the top results
 */

module.exports = {
  name: 'ytsearch',
  aliases: [],
  category: 'download',
  description: 'Search the YouTube video catalog and return the top results',
  usage: '.ytsearch Baileys whatsapp bot',
  example: '.ytsearch Baileys whatsapp bot',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;
    const name = 'ytsearch';
    const syntax = '.ytsearch Baileys whatsapp bot';
    const example = '.ytsearch Baileys whatsapp bot';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *YouTube Catalog Search (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    let ytSearch;
    try {
      ytSearch = require('yt-search');
    } catch (_) {
      return reply(`❌ *Search engine not installed.* Run \`npm install --ignore-scripts yt-search @distube/ytdl-core\` in the bot folder.`);
    }

    await reply(`🔎 *Searching YouTube catalog for:* ${query}\n\n_Please wait..._\n\n_${config.watermark}_`);

    try {
      const res = await ytSearch(query);
      const videos = (Array.isArray(res.videos) ? res.videos : []).filter((v) => v && v.videoId).slice(0, 6);

      if (videos.length === 0) {
        return reply(`❌ *No YouTube results found for:* ${query}`);
      }

      const list = videos
        .map((v, i) => {
          const duration =
            v.seconds && +v.seconds > 0
              ? `${Math.floor(+v.seconds / 60)}:${String(+v.seconds % 60).padStart(2, '0')}`
              : 'LIVE';
          const views = v.views != null ? Number(v.views).toLocaleString() : '?';
          return (
            `*${i + 1}. ${v.title}*\n` +
            `   👤 ${v.author?.name || 'Unknown'}  •  ⏱️ ${duration}  •  👁️ ${views}\n` +
            `   🔗 https://youtu.be/${v.videoId}\n`
          );
        })
        .join('');

      return reply(
        `╔═════『 *${config.botName} YOUTUBE CATALOG* 』═════\n` +
        `🔎 *Query:* ${query}\n` +
        `📄 *Results:* ${videos.length}\n` +
        `╚══════════════════════════════════\n\n` +
        list +
        `\n_${config.watermark}_`
      );
    } catch (err) {
      console.error('[YTSEARCH CMD ERROR]', err.message);
      return reply(`❌ *YouTube catalog search failed:* ${err.message}`);
    }
  }
};