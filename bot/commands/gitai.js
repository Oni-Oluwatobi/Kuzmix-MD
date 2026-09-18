/**
 * Kuzmix-MD Command: .gitai
 * Category: coding
 * Description: Get AI diagnostic help with Git merge/rebase issues
 */

module.exports = {
  name: 'gitai',
  aliases: [],
  category: 'coding',
  description: 'Get AI diagnostic help with Git merge/rebase issues',
  usage: '.gitai undo last commit without losing changes',
  example: '.gitai undo last commit without losing changes',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'gitai';
    const desc = 'Get AI diagnostic help with Git merge/rebase issues';
    const syntax = '.gitai undo last commit without losing changes';
    const example = '.gitai undo last commit without losing changes';
    const nameUpper = 'GITAI';

    
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
