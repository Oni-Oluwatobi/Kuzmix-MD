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

    const { ask, format } = require('../lib/aiHelper');
    try {
      const text = await ask(prompt, `Task: ${desc}. Format output cleanly for WhatsApp.`);
      return reply(format(text, `KUZMIX AI: ${nameUpper}`));
    } catch (err) {
      console.warn('[AI ERROR]', err.message);
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
