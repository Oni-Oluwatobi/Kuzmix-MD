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
    const { getJson, getBuffer } = require('../lib/httpClient');
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
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Educational tutor task: ${desc}. Question: ${query}. Provide step-by-step rigorous explanation.`,
        });
        if (res.text) {
          return reply(
            `╔═════『 *ACADEMIC TUTOR: ${nameUpper}* 』═════\n` +
            `${res.text.trim()}\n` +
            `╚═══════════════════════════════════════════\n\n` +
            `_${config.watermark}_`
          );
        }
      } catch (_) {}
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
