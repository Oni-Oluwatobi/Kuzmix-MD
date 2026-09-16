/**
 * Kuzmix-MD Command: .eval
 * Category: owner
 * Description: Execute JavaScript code on server (Developer only)
 */

module.exports = {
  name: 'eval',
  aliases: [],
  category: 'owner',
  description: 'Execute JavaScript code on server (Developer only)',
  usage: '.eval return process.memoryUsage()',
  example: '.eval return process.memoryUsage()',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'eval';
    const desc = 'Execute JavaScript code on server (Developer only)';
    const syntax = '.eval return process.memoryUsage()';
    const example = '.eval return process.memoryUsage()';
    const nameUpper = 'EVAL';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    const code = args.join(' ').trim();
    if (!code) return reply('Provide code to evaluate: \`' + config.prefix + 'eval 2 + 2\`');
    try {
      const result = eval(code);
      return reply(`💻 *Eval Output:*\n\`\`\`javascript\n${require('util').inspect(result, { depth: 1 })}\n\`\`\``);
    } catch (err) {
      return reply(`❌ *Eval Error:* ${err.message}`);
    }
    

  }
};
