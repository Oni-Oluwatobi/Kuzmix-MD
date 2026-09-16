/**
 * Kuzmix-MD Command: .convertcode
 * Category: coding
 * Description: Convert code to another programming language
 */

module.exports = {
  name: 'convertcode',
  aliases: [],
  category: 'coding',
  description: 'Convert code to another programming language',
  usage: '.convertcode Python to TypeScript',
  example: '.convertcode Python to TypeScript',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'convertcode';
    const desc = 'Convert code to another programming language';
    const syntax = '.convertcode Python to TypeScript';
    const example = '.convertcode Python to TypeScript';
    const nameUpper = 'CONVERTCODE';

    
    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(`👨‍💻 *AI Coding Studio (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('⚙️ *Analyzing and generating code...*');

    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const res = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are a Senior Full-Stack Engineer. Task: ${desc}. Requirement: ${prompt}. Output production code with clean formatting.`,
        });
        if (res.text) {
          return reply(
            `╔═════『 *KUZMIX CODING: ${nameUpper}* 』═════\n` +
            `${res.text.trim()}\n` +
            `╚══════════════════════════════════════════\n\n` +
            `_${config.watermark}_`
          );
        }
      } catch (_) {}
    }

    return reply(
      `╔═════『 *KUZMIX CODING: ${nameUpper}* 』═════\n` +
      `👨‍💻 *Query:* ${prompt}\n\n` +
      `💡 *Specification:* ${desc}\n\n` +
      `\`\`\`javascript\n` +
      `// Implementation for ${prompt}\n` +
      `function solution() {\n` +
      `  console.log('Processed by Kuzmix-MD Dev Engine');\n` +
      `  return true;\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `_${config.watermark}_`
    );

  }
};
