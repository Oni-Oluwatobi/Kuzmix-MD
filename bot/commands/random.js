/**
 * Kuzmix-MD Command: .random
 * Category: utilities
 * Description: Generate random number within range
 */

module.exports = {
  name: 'random',
  aliases: [],
  category: 'utilities',
  description: 'Generate random number within range',
  usage: '.random 1 100',
  example: '.random 1 100',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'random';
    const desc = 'Generate random number within range';
    const syntax = '.random 1 100';
    const example = '.random 1 100';
    const nameUpper = 'RANDOM';

    
    const input = args.join(' ').trim();
    
    const min = parseInt(args[0]) || 1;
    const max = parseInt(args[1]) || 100;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return reply(`🎲 *Random Number (${min} to ${max}):* *${num}*`);
    

  }
};
