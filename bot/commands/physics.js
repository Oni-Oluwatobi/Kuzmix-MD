/**
 * Kuzmix-MD Command: .physics
 * Category: education
 * Description: Physics theory, equations and problem breakdown
 */

module.exports = {
  name: 'physics',
  aliases: [],
  category: 'education',
  description: 'Physics theory, equations and problem breakdown',
  usage: '.physics calculate gravitational potential energy',
  example: '.physics calculate gravitational potential energy',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'physics';
    const desc = 'Physics theory, equations and problem breakdown';
    const syntax = '.physics calculate gravitational potential energy';
    const example = '.physics calculate gravitational potential energy';
    const nameUpper = 'PHYSICS';

    
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
