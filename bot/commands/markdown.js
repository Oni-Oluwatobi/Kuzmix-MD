/**
 * Kuzmix-MD Command: .markdown
 * Category: utilities
 * Description: Format and preview markdown text formatting
 */

module.exports = {
  name: 'markdown',
  aliases: [],
  category: 'utilities',
  description: 'Format and preview markdown text formatting',
  usage: '.markdown *bold* _italic_',
  example: '.markdown *bold* _italic_',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'markdown';
    const desc = 'Format and preview markdown text formatting';
    const syntax = '.markdown *bold* _italic_';
    const example = '.markdown *bold* _italic_';
    const nameUpper = 'MARKDOWN';

    
    const input = args.join(' ').trim();
    
    return reply(`🧰 *Utility (.${name}):* Format and preview markdown text formatting\n\n_${config.watermark}_`);
    

  }
};
