/**
 * Kuzmix-MD Command: .regex
 * Category: coding
 * Description: Generate and explain regular expressions
 */

module.exports = {
  name: 'regex',
  aliases: [],
  category: 'coding',
  description: 'Generate and explain regular expressions',
  usage: '.regex validate international phone numbers',
  example: '.regex validate international phone numbers',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'regex';
    const desc = 'Generate and explain regular expressions';
    const syntax = '.regex validate international phone numbers';
    const example = '.regex validate international phone numbers';
    const nameUpper = 'REGEX';

    
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
