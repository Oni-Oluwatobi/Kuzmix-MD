/**
 * Kuzmix-MD Command: .truth
 * Category: fun
 * Description: Generate a fun truth question for party games
 */

module.exports = {
  name: 'truth',
  aliases: [],
  category: 'fun',
  description: 'Generate a fun truth question for party games',
  usage: '.truth',
  example: '.truth',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'truth';
    const desc = 'Generate a fun truth question for party games';
    const syntax = '.truth';
    const example = '.truth';
    const nameUpper = 'TRUTH';

    
    
    const truths = [
      'What is the most embarrassing thing you have ever done?',
      'If you could swap lives with anyone in this chat for a day, who would it be?',
      'What is your biggest secret ambition?'
    ];
    return reply(`🎭 *TRUTH:*\n\n_${truths[Math.floor(Math.random() * truths.length)]}_\n\n_${config.watermark}_`);
    

  }
};
