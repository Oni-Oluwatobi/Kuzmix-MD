/**
 * Kuzmix-MD Command: .slogan
 * Category: creative
 * Description: Generate punchy marketing taglines & slogans
 */

module.exports = {
  name: 'slogan',
  aliases: [],
  category: 'creative',
  description: 'Generate punchy marketing taglines & slogans',
  usage: '.slogan ultra-fast cloud hosting',
  example: '.slogan ultra-fast cloud hosting',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'slogan';
    const desc = 'Generate punchy marketing taglines & slogans';
    const syntax = '.slogan ultra-fast cloud hosting';
    const example = '.slogan ultra-fast cloud hosting';
    const nameUpper = 'SLOGAN';

    
    const topic = args.join(' ').trim();
    if (!topic) {
      return reply(`🎨 *AI Creative Suite (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('✨ *Composing creative output...*');

    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Creative writing task: ${desc}. Topic: ${topic}. Make it highly expressive and creative.`,
        });
        if (res.text) {
          return reply(
            `╔═════『 *KUZMIX CREATIVE: ${nameUpper}* 』═════\n` +
            `${res.text.trim()}\n` +
            `╚══════════════════════════════════════════\n\n` +
            `_${config.watermark}_`
          );
        }
      } catch (_) {}
    }

    return reply(
      `╔═════『 *KUZMIX CREATIVE: ${nameUpper}* 』═════\n` +
      `🎭 *Topic:* ${topic}\n\n` +
      `"In the radiant tapestry of innovation, ${topic} shines with purpose and vision. ` +
      `Every line coded, every pulse of energy speaks to the boundless creativity of the mind."\n\n` +
      `╚══════════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );

  }
};
