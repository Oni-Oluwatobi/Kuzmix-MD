/**
 * Kuzmix-MD Command: .math
 * Category: education
 * Description: Step-by-step calculus, algebra & geometry help
 */

module.exports = {
  name: 'math',
  aliases: [],
  category: 'education',
  description: 'Step-by-step calculus, algebra & geometry help',
  usage: '.math integrate sin(x)*cos(x) dx',
  example: '.math integrate sin(x)*cos(x) dx',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'math';
    const desc = 'Step-by-step calculus, algebra & geometry help';
    const syntax = '.math integrate sin(x)*cos(x) dx';
    const example = '.math integrate sin(x)*cos(x) dx';
    const nameUpper = 'MATH';

    
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
