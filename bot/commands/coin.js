/**
 * Kuzmix-MD Command: .coin
 * Category: fun
 * Description: Flip a coin (Heads or Tails)
 */

module.exports = {
  name: 'coin',
  aliases: [],
  category: 'fun',
  description: 'Flip a coin (Heads or Tails)',
  usage: '.coin',
  example: '.coin',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'coin';
    const desc = 'Flip a coin (Heads or Tails)';
    const syntax = '.coin';
    const example = '.coin';
    const nameUpper = 'COIN';

    
    
    const isHeads = Math.random() < 0.5;
    return reply(
      `╔═════『 *COIN TOSS* 』═════\n` +
      `🪙 *Outcome:* *${isHeads ? 'HEADS' : 'TAILS'}*\n` +
      `╚═══════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
