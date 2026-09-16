/**
 * Kuzmix-MD Command: .play
 * Category: download
 * Description: Search YouTube and stream the audio directly into WhatsApp
 */

module.exports = {
  name: 'play',
  aliases: [],
  category: 'download',
  description: 'Search YouTube and stream audio into WhatsApp',
  usage: '.play Burna Boy City Boys',
  example: '.play Burna Boy City Boys',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { searchYoutubeAudio, downloadYoutubeAudio, formatMetadataCard } = require('../lib/youtube');
    const name = 'play';
    const syntax = '.play Burna Boy City Boys';
    const example = '.play Burna Boy City Boys';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`📥 *Audio Downloader (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply(`🔎 *Searching YouTube for:* ${query}\n\n_Please wait a moment..._\n\n_${config.watermark}_`);

    let meta;
    try {
      meta = await searchYoutubeAudio(query);
    } catch (err) {
      return reply(`❌ *Search failed:* ${err.message}`);
    }

    if (!meta) {
      return reply(`❌ *No playable audio found for:* ${query}`);
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
          ptt: true,
        },
        { quoted: msg }
      );

      return reply(formatMetadataCard(meta, config));
    } catch (err) {
      console.error('[PLAY CMD ERROR]', err.message);
      return reply(
        `⚠️ *Could not stream that audio:* ${err.message}\n\n` +
        `▪️ The video may be region-locked, age-restricted, or requires signing in.\n` +
        `▪️ Try a different query with \`${config.prefix}play <song name>\``
      );
    }
  }
};