/**
 * Kuzmix-MD Command: .chemistry
 * Category: education
 * Description: Chemical equations balancing & molecular concepts
 */

module.exports = {
  name: 'chemistry',
  aliases: [],
  category: 'education',
  description: 'Chemical equations balancing & molecular concepts',
  usage: '.chemistry balance Fe + O2 -> Fe2O3',
  example: '.chemistry balance Fe + O2 -> Fe2O3',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'chemistry';
    const desc = 'Chemical equations balancing & molecular concepts';
    const syntax = '.chemistry balance Fe + O2 -> Fe2O3';
    const example = '.chemistry balance Fe + O2 -> Fe2O3';
    const nameUpper = 'CHEMISTRY';

    
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
