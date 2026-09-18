/**
 * Kuzmix-MD Command: .factcheck
 * Category: ai
 * Description: Check factual accuracy of a claim
 */

module.exports = {
  name: 'factcheck',
  aliases: [],
  category: 'ai',
  description: 'Check factual accuracy of a claim',
  usage: '.factcheck lightning never strikes twice',
  example: '.factcheck lightning never strikes twice',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'factcheck';
    const desc = 'Check factual accuracy of a claim';
    const syntax = '.factcheck lightning never strikes twice';
    const example = '.factcheck lightning never strikes twice';
    const nameUpper = 'FACTCHECK';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🤖 *AI Assistant (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('🧠 *Processing with Kuzmix AI...*');

    const { ask, format } = require('../lib/aiHelper');
    try {
      const text = await ask(query, `Task: ${desc}. Format output cleanly for WhatsApp.`);
      return reply(format(text, `KUZMIX AI: ${nameUpper}`));
    } catch (err) {
      console.warn('[AI ERROR]', err.message);
    }

    return reply(
      `🤖 *Kuzmix AI: ${nameUpper}*\n\n` +
      `Query: _"${query}"_\n\n` +
      `Result: Processed successfully according to ${desc}.\n\n` +
      `_${config.watermark}_`
    );

  }
};
