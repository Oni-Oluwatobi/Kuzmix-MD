/**
 * Kuzmix-MD Command: .dare
 * Category: fun
 * Description: Generate a harmless fun dare challenge
 */

module.exports = {
  name: 'dare',
  aliases: [],
  category: 'fun',
  description: 'Generate a harmless fun dare challenge',
  usage: '.dare',
  example: '.dare',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'dare';
    const desc = 'Generate a harmless fun dare challenge';
    const syntax = '.dare';
    const example = '.dare';
    const nameUpper = 'DARE';

    
    
    const dares = [
      'Send a voice note singing the chorus of your favorite song!',
      'Change your WhatsApp status to "Kuzmix-MD Bot Rules" for 1 hour!',
      'Tell the funniest joke you know right now.'
    ];
    return reply(`🔥 *DARE:*\n\n_${dares[Math.floor(Math.random() * dares.length)]}_\n\n_${config.watermark}_`);
    

  }
};
