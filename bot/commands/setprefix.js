/**
 * Kuzmix-MD Command: .setprefix
 * Category: owner
 * Description: Change global bot trigger prefix dynamically
 */

module.exports = {
  name: 'setprefix',
  aliases: [],
  category: 'owner',
  description: 'Change global bot trigger prefix dynamically',
  usage: '.setprefix !',
  example: '.setprefix !',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'setprefix';
    const desc = 'Change global bot trigger prefix dynamically';
    const syntax = '.setprefix !';
    const example = '.setprefix !';
    const nameUpper = 'SETPREFIX';

    
    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    
    const newPrefix = args[0];
    if (!newPrefix) return reply('Specify a new prefix: \`' + config.prefix + 'setprefix !\`');
    config.prefix = newPrefix;
    return reply(`✅ *Global bot trigger prefix updated to:* \`${newPrefix}\``);
    

  }
};
