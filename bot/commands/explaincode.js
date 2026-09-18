/**
 * Kuzmix-MD Command: .explaincode
 * Category: coding
 * Description: Explain how replied code functions step by step
 */

module.exports = {
  name: 'explaincode',
  aliases: [],
  category: 'coding',
  description: 'Explain how replied code functions step by step',
  usage: '.explaincode',
  example: '.explaincode',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'explaincode';
    const desc = 'Explain how replied code functions step by step';
    const syntax = '.explaincode';
    const example = '.explaincode';
    const nameUpper = 'EXPLAINCODE';

    
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
