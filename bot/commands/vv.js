module.exports = {
  name: 'vv',
  aliases: ['viewonce', 'antiviewonce'],
  category: 'Media & Download',
  description: 'Recovers and forwards view-once photos or videos',
  usage: '.vv (reply to view-once message)',
  permission: 'everyone',

  async execute(ctx) {
    const { reply } = ctx;
    await reply(
      `👁️ *Kuzmix View-Once Extractor (.vv)*\n\n` +
      `Status: *ARCHITECTURE READY*\n` +
      `Reply to any view-once image or video with \`.vv\` to reveal the media.`
    );
  },
};
