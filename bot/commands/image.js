/**
 * Kuzmix-MD Command: .image
 * Category: search
 * Description: Search the web for images and send results
 */

module.exports = {
  name: 'image',
  aliases: ['imgsearch', 'searchimg', 'pic'],
  category: 'search',
  description: 'Search the web for images',
  usage: '.image <search query>',
  example: '.image sunset over mountains',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');

    const query = args.join(' ').trim();
    if (!query) {
      return reply(
        `🔍 *Image Search*\n\n` +
        `Usage: \`.image <search query>\`\n` +
        `Example: \`.image sunset over mountains\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🔍 *Searching images for:* ${query}\n\n_Please wait..._`);

    try {
      const results = await searchImages(getJson, query);

      if (!results || results.length === 0) {
        return reply(`❌ *No images found for:* ${query}\n\n_Try a different search term._`);
      }

      const picked = results.slice(0, 4);

      for (let i = 0; i < picked.length; i++) {
        const img = picked[i];
        try {
          const buffer = await getBuffer(img.url, { timeout: 30000 });
          if (buffer && buffer.length > 1000) {
            const caption =
              `🖼️ *${query}* (${i + 1}/${picked.length})\n` +
              (img.title ? `📝 ${img.title}\n` : '') +
              (img.source ? `🌐 ${img.source}\n` : '') +
              `\n_${config.watermark}_`;

            await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
            await new Promise(r => setTimeout(r, 500));
          }
        } catch (_) {}
      }
    } catch (err) {
      console.error('[IMAGE SEARCH ERROR]', err.message);
      return reply(`❌ *Image search failed:* ${err.message}`);
    }
  }
};

async function searchImages(getJson, query) {
  const errors = [];

  // Try DuckDuckGo image search
  try {
    const ddgUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iar=images&iax=images&ia=images`;
    const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&t=kuzmix`;
    const data = await getJson(ddgApiUrl, { timeout: 8000 });
    if (data?.RelatedTopics?.length > 0) {
      const imgs = data.RelatedTopics
        .filter(t => t.Text && (t.FirstURL || t.Image))
        .map(t => ({
          url: t.Image || `https://duckduckgo.com${t.FirstURL}`,
          title: t.Text?.slice(0, 100) || '',
          source: 'DuckDuckGo',
        }));
      if (imgs.length > 0) return imgs;
    }
  } catch (e) { errors.push('DuckDuckGo: ' + e.message); }

  // Try Unsplash source
  try {
    const unsplashUrl = `https://source.unsplash.com/1024x1024/?${encodeURIComponent(query)}`;
    return [{
      url: unsplashUrl,
      title: query,
      source: 'Unsplash',
    }];
  } catch (e) { errors.push('Unsplash: ' + e.message); }

  // Try Lorem Picsum with search
  try {
    const picsumUrl = `https://picsum.photos/1024/1024`;
    return [{
      url: picsumUrl,
      title: query,
      source: 'Picsum',
    }];
  } catch (e) { errors.push('Picsum: ' + e.message); }

  throw new Error('All image search engines failed: ' + errors.join('; '));
}
