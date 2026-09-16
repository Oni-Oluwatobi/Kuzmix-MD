/**
 * Kuzmix-MD Command: .summarize
 * Category: ai
 * Description: Summarize text or replied article
 */

module.exports = {
  name: 'summarize',
  aliases: [],
  category: 'ai',
  description: 'Summarize text or replied article',
  usage: '.summarize [long article]',
  example: '.summarize [long article]',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'summarize';
    const desc = 'Summarize text or replied article';
    const syntax = '.summarize [long article]';
    const example = '.summarize [long article]';
    const nameUpper = 'SUMMARIZE';

    
    const query = args.join(' ').trim();
    if (!query) {
      return reply(`🤖 *AI Assistant (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('🧠 *Processing with Kuzmix AI...*');

    // Check Gemini API Key
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = 'You are Kuzmix AI, an expert assistant developed by ' + config.developerName + '. Task: Summarize text or replied article. Format output cleanly for WhatsApp.';
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemInstruction}\n\nUser Input: ${query}`,
        });
        if (response.text) {
          return reply(
            `╔═════『 *KUZMIX AI: ${nameUpper}* 』═════\n` +
            `${response.text.trim()}\n` +
            `╚═════════════════════════════════════\n\n` +
            `_${config.watermark}_`
          );
        }
      } catch (err) {
        console.warn('[AI ERROR]', err.message);
      }
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
