/**
 * Kuzmix-MD Command: .compliment
 * Category: fun
 * Description: Generate a genuine uplifting compliment
 */

module.exports = {
  name: 'compliment',
  aliases: [],
  category: 'fun',
  description: 'Generate a genuine uplifting compliment',
  usage: '.compliment @user',
  example: '.compliment @user',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'compliment';
    const desc = 'Generate a genuine uplifting compliment';
    const syntax = '.compliment @user';
    const example = '.compliment @user';
    const nameUpper = 'COMPLIMENT';

    
    
    const target = args.join(' ') || 'my friend';
    const comps = [
      'You have an incredible energy that makes everyone feel valued and inspired!',
      'Your creativity and sharp mindset are unmatched.',
      'The world is a much brighter and more interesting place with you in it!'
    ];
    return reply(`✨ *Compliment for ${target}:*\n\n_${comps[Math.floor(Math.random() * comps.length)]}_\n\n_${config.watermark}_`);
    

  }
};
