/**
 * Kuzmix-MD Wikipedia Search Command (.wiki / .wikipedia)
 * Instant topic encyclopedic summary via official Wikipedia REST API
 */

module.exports = {
  name: 'wiki',
  aliases: ['wikipedia', 'encyclopedia', 'info'],
  category: 'Internet & Search',
  description: 'Searches Wikipedia and provides an encyclopedic summary',
  usage: '.wiki [search topic]',
  example: '.wiki Albert Einstein',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const query = args.join(' ').trim();
    if (!query) {
      return reply(
        `📚 *Kuzmix Wikipedia Search*\n\n` +
        `Please specify a topic to search:\n` +
        `👉 \`${config.prefix}wiki Artificial Intelligence\`\n` +
        `👉 \`${config.prefix}wiki Nikola Tesla\`\n` +
        `👉 \`${config.prefix}wiki Nigeria\``
      );
    }

    await reply(`🔍 *Searching Wikipedia for "${query}"...*`);

    try {
      const { getJson } = require('../lib/httpClient');
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const data = await getJson(url, {
        headers: { 'User-Agent': 'Kuzmix-MD-Bot/1.0 (WhatsApp Multi-Device Assistant)' },
        timeout: 10000,
      });
      if (!data || data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
        throw new Error('Topic not found');
      }

      const title = data.title || query;
      const extract = data.extract || 'No text summary available.';
      const pageUrl = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`;
      const description = data.description ? `_${data.description}_\n\n` : '';

      const wikiMsg =
        `╔═════『 *WIKIPEDIA: ${title.toUpperCase()}* 』═════\n` +
        `${description}` +
        `${extract}\n\n` +
        `🔗 *Full Article:* ${pageUrl}\n` +
        `╚═════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await reply(wikiMsg);
    } catch (err) {
      console.error('[WIKI CMD ERROR]', err.message);
      await reply(
        `❌ *No Wikipedia article found for "${query}"*\n` +
        `Please verify the spelling or try broader terms.\n` +
        `_Example: \`${config.prefix}wiki Solar System\`_`
      );
    }
  },
};
