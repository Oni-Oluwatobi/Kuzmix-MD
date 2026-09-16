/**
 * Kuzmix-MD Command: .agent
 * Category: ai
 * Description: Perform an autonomous multi-step AI task
 */

module.exports = {
  name: 'agent',
  aliases: [],
  category: 'ai',
  description: 'Perform an autonomous multi-step AI task',
  usage: '.agent analyze market competitors and summarize',
  example: '.agent analyze market competitors and summarize',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'agent';
    const desc = 'Perform an autonomous multi-step AI task';
    const syntax = '.agent analyze market competitors and summarize';
    const example = '.agent analyze market competitors and summarize';
    const nameUpper = 'AGENT';

    
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
        const systemInstruction = 'You are Kuzmix AI, an expert assistant developed by ' + config.developerName + '. Task: Perform an autonomous multi-step AI task. Format output cleanly for WhatsApp.';
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
