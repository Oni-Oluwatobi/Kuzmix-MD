/**
 * Kuzmix-MD Command: .roast
 * Category: fun
 * Description: Generate a lighthearted friendly roast
 */

module.exports = {
  name: 'roast',
  aliases: [],
  category: 'fun',
  description: 'Generate a lighthearted friendly roast',
  usage: '.roast @user',
  example: '.roast @user',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'roast';
    const desc = 'Generate a lighthearted friendly roast';
    const syntax = '.roast @user';
    const example = '.roast @user';
    const nameUpper = 'ROAST';

    
    
    const target = args.join(' ') || 'my friend';
    const roasts = [
      'You bring everyone so much joy... whenever you leave the room!',
      'I would explain it to you, but I do not have enough crayons.',
      'You are like a cloud. When you disappear, it turns into a beautiful day.',
      'I thought of you today. It reminded me to take out the trash.'
    ];
    return reply(`🔥 *Roast for ${target}:*\n\n_${roasts[Math.floor(Math.random() * roasts.length)]}_\n\n_${config.watermark}_`);
    

  }
};
