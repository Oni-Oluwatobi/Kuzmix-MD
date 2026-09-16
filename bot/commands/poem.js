/**
 * Kuzmix-MD Command: .poem
 * Category: creative
 * Description: Generate an original expressive poem
 */

module.exports = {
  name: 'poem',
  aliases: [],
  category: 'creative',
  description: 'Generate an original expressive poem',
  usage: '.poem ode to late-night coding',
  example: '.poem ode to late-night coding',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'poem';
    const desc = 'Generate an original expressive poem';
    const syntax = '.poem ode to late-night coding';
    const example = '.poem ode to late-night coding';
    const nameUpper = 'POEM';

    
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
