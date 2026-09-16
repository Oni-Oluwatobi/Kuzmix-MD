/**
 * Kuzmix-MD Command: .exec
 * Category: owner
 * Description: Execute bash terminal command on host VPS
 */

module.exports = {
  name: 'exec',
  aliases: [],
  category: 'owner',
  description: 'Execute bash terminal command on host VPS',
  usage: '.exec git status',
  example: '.exec git status',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'exec';
    const desc = 'Execute bash terminal command on host VPS';
    const syntax = '.exec git status';
    const example = '.exec git status';
    const nameUpper = 'EXEC';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    const cmdStr = args.join(' ').trim();
    if (!cmdStr) return reply('Provide command to execute: \`' + config.prefix + 'exec ls\`');
    const { exec } = require('child_process');
    exec(cmdStr, (err, stdout, stderr) => {
      const out = stdout || stderr || (err ? err.message : 'Command executed without output.');
      return reply(`💻 *Terminal Output:*\n\`\`\`bash\n${out.slice(0, 1500)}\n\`\`\``);
    });
    

  }
};
