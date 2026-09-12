module.exports = {
  name: 'sticker',
  aliases: ['s', 'stick'],
  category: 'Media & Download',
  description: 'Converts an image or video to a WhatsApp sticker',
  usage: '.sticker (reply to image)',
  permission: 'everyone',

  async execute(ctx) {
    const { reply } = ctx;
    await reply(
      `🎨 *Kuzmix Sticker Maker*\n\n` +
      `Reply to an image or short video with \`.sticker\` to create a WhatsApp sticker.\n` +
      `_(Note: Requires ffmpeg installed on host server)_`
    );
  },
};
