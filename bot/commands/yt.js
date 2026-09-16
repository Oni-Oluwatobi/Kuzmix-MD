/**
 * Kuzmix-MD Command: .yt
 * Category: download
 * Description: Search YouTube and return the top matching videos with links
 */

module.exports = {
  name: 'yt',
  aliases: [],
  category: 'download',
  description: 'Search YouTube and return the top matching videos with links',
  usage: '.yt Burna Boy City Boys',
  example: '.yt Next.js tutorial',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;
    const name = 'yt';
    const syntax = '.yt Burna Boy City Boys';
    const example = '.yt Burna Boy City Boys';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📺 *YouTube Search (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    let ytSearch;
    try {
      ytSearch = require('yt-search');
    } catch (_) {
      return reply(`❌ *Search engine not installed.* Run \`npm install --ignore-scripts yt-search @distube/ytdl-core\` in the bot folder.`);
    }

    await reply(`🔎 *Searching YouTube for:* ${query}\n\n_Please wait..._\n\n_${config.watermark}_`);

    try {
      const res = await ytSearch(query);
      const videos = (Array.isArray(res.videos) ? res.videos : []).filter((v) => v && v.videoId).slice(0, 6);

      if (videos.length === 0) {
        return reply(`❌ *No YouTube results found for:* ${query}`);
      }

      const card =
        `╔═════『 *${config.botName} YOUTUBE SEARCH* 』═════\n` +
        `🔎 *Query:* ${query}\n` +
        `📄 *Results:* ${videos.length}\n` +
        `╚══════════════════════════════════\n\n`;

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

      return reply(card + list + `\n_${config.watermark}_`);
    } catch (err) {
      console.error('[YT CMD ERROR]', err.message);
      return reply(`❌ *YouTube search failed:* ${err.message}`);
    }
  }
};