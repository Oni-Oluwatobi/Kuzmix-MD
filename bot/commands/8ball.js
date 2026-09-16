/**
 * Kuzmix-MD Command: .8ball
 * Category: fun
 * Description: Ask Magic 8-Ball oracle any question
 */

module.exports = {
  name: '8ball',
  aliases: [],
  category: 'fun',
  description: 'Ask Magic 8-Ball oracle any question',
  usage: '.8ball Will my bot deploy successfully?',
  example: '.8ball Will my bot deploy successfully?',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = '8ball';
    const desc = 'Ask Magic 8-Ball oracle any question';
    const syntax = '.8ball Will my bot deploy successfully?';
    const example = '.8ball Will my bot deploy successfully?';
    const nameUpper = '8BALL';

    
    
    const question = args.join(' ').trim();
    if (!question) return reply('🎱 Please ask a question: \`' + config.prefix + '8ball Will I achieve my goals?\`');
    const answers = [
      'It is certain.', 'Without a doubt.', 'Yes definitely.', 'You may rely on it.',
      'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.',
      'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
      'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
      'Don\'t count on it.', 'My reply is no.', 'My sources say no.',
      'Outlook not so good.', 'Very doubtful.'
    ];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    return reply(
      `╔═════『 *MAGIC 8-BALL ORACLE* 』═════\n` +
      `❓ *Question:* ${question}\n` +
      `🎱 *Answer:* *${answer}*\n` +
      `╚═════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
