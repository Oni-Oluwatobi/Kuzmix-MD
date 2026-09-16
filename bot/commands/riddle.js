/**
 * Kuzmix-MD Command: .riddle
 * Category: fun
 * Description: Generate a brain-teaser riddle with revealable answer
 */

module.exports = {
  name: 'riddle',
  aliases: [],
  category: 'fun',
  description: 'Generate a brain-teaser riddle with revealable answer',
  usage: '.riddle',
  example: '.riddle',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'riddle';
    const desc = 'Generate a brain-teaser riddle with revealable answer';
    const syntax = '.riddle';
    const example = '.riddle';
    const nameUpper = 'RIDDLE';

    
    
    return reply(
      `🧩 *KUZMIX RIDDLE*\n\n` +
      `*Riddle:* What has keys but no locks, space but no room, and you can enter but not go in?\n\n` +
      `💡 *Answer:* _A Keyboard!_\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
