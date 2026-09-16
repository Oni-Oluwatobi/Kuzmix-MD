/**
 * Kuzmix-MD Command: .name
 * Category: creative
 * Description: Generate unique names for apps, brands, or characters
 */

module.exports = {
  name: 'name',
  aliases: [],
  category: 'creative',
  description: 'Generate unique names for apps, brands, or characters',
  usage: '.name futuristic fintech platform',
  example: '.name futuristic fintech platform',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'name';
    const desc = 'Generate unique names for apps, brands, or characters';
    const syntax = '.name futuristic fintech platform';
    const example = '.name futuristic fintech platform';
    const nameUpper = 'NAME';

    
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
