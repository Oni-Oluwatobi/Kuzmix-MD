/**
 * Kuzmix-MD Command: .flashcards
 * Category: education
 * Description: Generate digital Q&A flashcards for any topic
 */

module.exports = {
  name: 'flashcards',
  aliases: [],
  category: 'education',
  description: 'Generate digital Q&A flashcards for any topic',
  usage: '.flashcards Nigerian History',
  example: '.flashcards Nigerian History',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'flashcards';
    const desc = 'Generate digital Q&A flashcards for any topic';
    const syntax = '.flashcards Nigerian History';
    const example = '.flashcards Nigerian History';
    const nameUpper = 'FLASHCARDS';

    
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
