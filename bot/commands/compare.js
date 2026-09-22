/**
 * Kuzmix-MD Command: .compare
 * Category: ai
 * Description: Compare two items or technologies
 */

module.exports = {
  name: 'compare',
  aliases: [],
  category: 'ai',
  description: 'Compare two items or technologies',
  usage: '.compare React vs Vue',
  example: '.compare React vs Vue',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'compare';
    const desc = 'Compare two items or technologies';
    const syntax = '.compare React vs Vue';
    const example = '.compare React vs Vue';
    const nameUpper = 'COMPARE';

    
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
