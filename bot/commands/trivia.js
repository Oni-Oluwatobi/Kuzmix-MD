/**
 * Kuzmix-MD Command: .trivia
 * Category: fun
 * Description: Generate trivia question with points scoring
 */

module.exports = {
  name: 'trivia',
  aliases: [],
  category: 'fun',
  description: 'Generate trivia question with points scoring',
  usage: '.trivia',
  example: '.trivia',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'trivia';
    const desc = 'Generate trivia question with points scoring';
    const syntax = '.trivia';
    const example = '.trivia';
    const nameUpper = 'TRIVIA';

    
    
    return reply(
      `🎯 *TRIVIA QUESTION*\n\n` +
      `*Question:* Which planet has the most moons in our Solar System?\n\n` +
      `A) Jupiter\nB) Saturn\nC) Mars\nD) Neptune\n\n` +
      `💡 *Correct Answer:* _B) Saturn (with 146 confirmed moons)!_\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
