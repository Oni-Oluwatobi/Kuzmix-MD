/**
 * Kuzmix-MD Command: .solve
 * Category: education
 * Description: Solve complex academic questions step by step
 */

module.exports = {
  name: 'solve',
  aliases: [],
  category: 'education',
  description: 'Solve complex academic questions step by step',
  usage: '.solve 2x^2 + 5x - 12 = 0',
  example: '.solve 2x^2 + 5x - 12 = 0',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'solve';
    const desc = 'Solve complex academic questions step by step';
    const syntax = '.solve 2x^2 + 5x - 12 = 0';
    const example = '.solve 2x^2 + 5x - 12 = 0';
    const nameUpper = 'SOLVE';

    
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
