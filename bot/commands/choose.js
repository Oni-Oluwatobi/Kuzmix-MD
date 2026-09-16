/**
 * Kuzmix-MD Command: .choose
 * Category: fun
 * Description: Randomly choose between provided options
 */

module.exports = {
  name: 'choose',
  aliases: [],
  category: 'fun',
  description: 'Randomly choose between provided options',
  usage: '.choose Pizza | Burger | Shawarma',
  example: '.choose Pizza | Burger | Shawarma',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'choose';
    const desc = 'Randomly choose between provided options';
    const syntax = '.choose Pizza | Burger | Shawarma';
    const example = '.choose Pizza | Burger | Shawarma';
    const nameUpper = 'CHOOSE';

    
    
    const options = args.join(' ').split(/[|,]/).map(o => o.trim()).filter(Boolean);
    if (options.length < 2) return reply('🤔 Provide at least 2 options: \`' + config.prefix + 'choose Pizza | Burger | Sushi\`');
    const pick = options[Math.floor(Math.random() * options.length)];
    return reply(
      `╔═════『 *RANDOM PICKER* 』═════\n` +
      `🎯 *I choose:* *${pick}*\n` +
      `╚═══════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
