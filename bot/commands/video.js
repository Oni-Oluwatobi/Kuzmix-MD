/**
 * Kuzmix-MD Command: .video
 * Category: download
 * Description: Search YouTube and download a video (mp4)
 */

module.exports = {
  name: 'video',
  aliases: ['vd', 'mp4'],
  category: 'download',
  description: 'Search YouTube and download a video (mp4)',
  usage: '.video Burna Boy concert performance',
  example: '.video Next.js tutorial',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { searchYoutubeAudio, downloadYoutubeVideo, formatMetadataCard } = require('../lib/youtube');

    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🎬 *Video Downloader*\n\nUsage: \`.video <search query>\`\nExample: \`.video Next.js tutorial\``);
    }

    await reply(`🔎 *Searching for:* ${query}\n\n_Please wait..._\n\n_${config.watermark}_`);

    let meta;
    try {
      meta = await searchYoutubeAudio(query);
    } catch (err) {
      return reply(`❌ *Search failed:* ${err.message}`);
    }

    await reply(`🎬 *Found:* ${meta.title}\n\n_Downloading video... please wait._`);

    try {
      const buffer = await downloadYoutubeVideo(meta);

      if (!buffer || buffer.length === 0) {
        return reply(`❌ *Download failed:* Empty video stream.`);
      }

      await sock.sendMessage(
        from,
        {
          video: buffer,
          mimetype: 'video/mp4',
          caption:
            `🎬 *${meta.title}*\n` +
            `👤 ${meta.author}\n` +
            `⏱️ ${meta.duration}\n` +
            `🔗 ${meta.url}\n\n` +
            `_${config.watermark}_`,
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error('[VIDEO CMD ERROR]', err.message);
      return reply(
        `⚠️ *Could not download video:* ${err.message}\n\n` +
        `▪️ Try \`${config.prefix}video <different query>\` or use \`${config.prefix}audio\` for audio only.`
      );
    }
  }
};
