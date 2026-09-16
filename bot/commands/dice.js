/**
 * Kuzmix-MD Command: .dice
 * Category: fun
 * Description: Roll a random 6-sided dice (1-6)
 */

module.exports = {
  name: 'dice',
  aliases: [],
  category: 'fun',
  description: 'Roll a random 6-sided dice (1-6)',
  usage: '.dice',
  example: '.dice',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'dice';
    const desc = 'Roll a random 6-sided dice (1-6)';
    const syntax = '.dice';
    const example = '.dice';
    const nameUpper = 'DICE';

    
    
    const sides = parseInt(args[0]) || 6;
    const roll = Math.floor(Math.random() * sides) + 1;
    const icons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const icon = sides === 6 ? icons[roll - 1] : '🎲';
    return reply(
      `╔═════『 *DICE ROLL* 』═════\n` +
      `🎲 *Sides:* D${sides}\n` +
      `🎯 *You rolled:* ${icon} *${roll}*\n` +
      `╚═══════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
