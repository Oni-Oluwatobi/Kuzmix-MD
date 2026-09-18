/**
 * Kuzmix-MD Command: .study
 * Category: education
 * Description: Generate customized revision & study plan
 */

module.exports = {
  name: 'study',
  aliases: [],
  category: 'education',
  description: 'Generate customized revision & study plan',
  usage: '.study Data Structures in 2 weeks',
  example: '.study Data Structures in 2 weeks',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'study';
    const desc = 'Generate customized revision & study plan';
    const syntax = '.study Data Structures in 2 weeks';
    const example = '.study Data Structures in 2 weeks';
    const nameUpper = 'STUDY';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🎓 *Academic Tutor (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('📚 *Consulting academic knowledge repository...*');
    const { ask, format } = require('../lib/aiHelper');
    try {
      const text = await ask(query, `Task: ${desc}. Format output cleanly for WhatsApp.`);
      return reply(format(text, `KUZMIX AI: ${nameUpper}`));
    } catch (err) {
      console.warn('[AI ERROR]', err.message);
    }

    return reply(
      `╔═════『 *ACADEMIC TUTOR: ${nameUpper}* 』═════\n` +
      `📖 *Topic:* ${query}\n\n` +
      `🎯 *Solution & Explanation:*\n` +
      `The concepts underlying ${query} revolve around foundational mathematical, physical, and scientific principles.\n\n` +
      `╚═══════════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );

  }
};
