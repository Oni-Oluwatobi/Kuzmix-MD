/**
 * Kuzmix-MD Command: .biology
 * Category: education
 * Description: Cellular biology, genetics & physiology explanations
 */

module.exports = {
  name: 'biology',
  aliases: [],
  category: 'education',
  description: 'Cellular biology, genetics & physiology explanations',
  usage: '.biology explain DNA replication fork',
  example: '.biology explain DNA replication fork',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'biology';
    const desc = 'Cellular biology, genetics & physiology explanations';
    const syntax = '.biology explain DNA replication fork';
    const example = '.biology explain DNA replication fork';
    const nameUpper = 'BIOLOGY';

    
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
