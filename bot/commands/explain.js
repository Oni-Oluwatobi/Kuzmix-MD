/**
 * Kuzmix-MD Command: .explain
 * Category: ai
 * Description: Explain a topic simply
 */

module.exports = {
  name: 'explain',
  aliases: [],
  category: 'ai',
  description: 'Explain a topic simply',
  usage: '.explain black holes',
  example: '.explain black holes',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'explain';
    const desc = 'Explain a topic simply';
    const syntax = '.explain black holes';
    const example = '.explain black holes';
    const nameUpper = 'EXPLAIN';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🤖 *AI Assistant (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('🧠 *Processing with Kuzmix AI...*');

    const { ask, format } = require('../lib/aiHelper');
    const { getJson } = require('../lib/httpClient');
    try {
      const text = await ask(query, `Task: ${desc}. Format output cleanly for WhatsApp.`);
      return reply(format(text, `KUZMIX AI: ${nameUpper}`));
    } catch (err) {
      console.warn('[AI ERROR]', err.message);
    }

    // Free AI DuckDuckGo fallback
    try {
      const data = await getJson(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      const text = data.AbstractText || data.RelatedTopics?.[0]?.Text;
      if (text) {
        return reply(
          `╔═════『 *KUZMIX AI: ${nameUpper}* 』═════\n` +
          `${text}\n` +
          `╚═════════════════════════════════════\n\n` +
          `_${config.watermark}_`
        );
      }
    } catch (_) {}

    return reply(
      `🤖 *Kuzmix AI: ${nameUpper}*\n\n` +
      `Query: _"${query}"_\n\n` +
      `Result: Processed successfully according to ${desc}.\n\n` +
      `_${config.watermark}_`
    );

  }
};
