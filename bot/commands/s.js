/**
 * Kuzmix-MD Command: .s
 * Category: Media & Download
 * Description: Short alias for sticker creation
 */

const stickerCmd = require('./sticker');

module.exports = {
  name: 's',
  aliases: [],
  category: 'Media & Download',
  description: 'Short alias for sticker creation',
  usage: '.s',
  example: '.s',
  permission: 'everyone',

  async execute(ctx) {
    return stickerCmd.execute(ctx);
  },
};
