/**
 * Kuzmix-MD Command: .song
 * Category: download
 * Description: Search YouTube and download the full song as audio
 */

module.exports = {
  name: 'song',
  aliases: ['songdl'],
  category: 'download',
  description: 'Search YouTube and download the full song as audio',
  usage: '.song Asake Lonely At The Top',
  example: '.song Asake Lonely At The Top',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { searchYoutubeAudio, downloadYoutubeAudio, formatMetadataCard } = require('../lib/youtube');
    const name = 'song';
    const syntax = '.song Asake Lonely At The Top';
    const example = '.song Asake Lonely At The Top';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Song Downloader (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply(`🎧 *Searching for:* ${query}\n\n_Fetching the highest-quality audio stream..._\n\n_${config.watermark}_`);

    let meta;
    try {
      meta = await searchYoutubeAudio(query);
    } catch (err) {
      return reply(`❌ *Search failed:* ${err.message}`);
    }

    if (!meta) {
      return reply(`❌ *No playable song found for:* ${query}`);
    }

    try {
      const buffer = await downloadYoutubeAudio(meta);

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* YouTube returned an empty audio stream for "${meta.title}".`);
      }

      await sock.sendMessage(
        from,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: false,
        },
        { quoted: msg }
      );

      return reply(formatMetadataCard(meta, config));
    } catch (err) {
      console.error('[SONG CMD ERROR]', err.message);
      return reply(
        `⚠️ *Could not download that song:* ${err.message}\n\n` +
        `▪️ The video may be region-locked or age-restricted.\n` +
        `▪️ Try a different query with \`${config.prefix}song <title>\``
      );
    }
  }
};