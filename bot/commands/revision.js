/**
 * Kuzmix-MD Command: .revision
 * Category: education
 * Description: Generate high-yield revision summaries
 */

module.exports = {
  name: 'revision',
  aliases: [],
  category: 'education',
  description: 'Generate high-yield revision summaries',
  usage: '.revision Organic Chemistry functional groups',
  example: '.revision Organic Chemistry functional groups',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'revision';
    const desc = 'Generate high-yield revision summaries';
    const syntax = '.revision Organic Chemistry functional groups';
    const example = '.revision Organic Chemistry functional groups';
    const nameUpper = 'REVISION';

    
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
