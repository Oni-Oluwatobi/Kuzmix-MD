/**
 * Kuzmix-MD Command: .music
 * Category: download
 * Description: Search YouTube Premium and stream high-quality music audio
 */

module.exports = {
  name: 'music',
  aliases: ['piano'],
  category: 'download',
  description: 'Search YouTube and stream high-quality music audio',
  usage: '.music CKay Love Nwantiti',
  example: '.music CKay Love Nwantiti',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { searchYoutubeAudio, downloadYoutubeAudio, formatMetadataCard } = require('../lib/youtube');
    const name = 'music';
    const syntax = '.music CKay Love Nwantiti';
    const example = '.music CKay Love Nwantiti';

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🎶 *Music Streaming (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply(`🎼 *Searching for:* ${query}\n\n_Loading the best available audio stream..._\n\n_${config.watermark}_`);

    let meta;
    try {
      meta = await searchYoutubeAudio(query);
    } catch (err) {
      return reply(`❌ *Search failed:* ${err.message}`);
    }

    if (!meta) {
      return reply(`❌ *No music found for:* ${query}`);
    }

    try {
      const buffer = await downloadYoutubeAudio(meta);

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* Empty audio stream for "${meta.title}".`);
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
      console.error('[MUSIC CMD ERROR]', err.message);
      return reply(`⚠️ *Could not stream that track:* ${err.message}\n\n▪️ Try a different query with \`${config.prefix}music <title>\``);
    }
  }
};