/**
 * Kuzmix-MD Command: .getpp
 * Category: group
 * Description: Get full-res group profile picture
 */

module.exports = {
  name: 'getpp',
  aliases: [],
  category: 'group',
  description: 'Get full-res group profile picture',
  usage: '.getpp',
  example: '.getpp',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'getpp';
    const desc = 'Get full-res group profile picture';
    const syntax = '.getpp';
    const example = '.getpp';
    const nameUpper = 'GETPP';

    
    
    return reply(
      `👥 *Group Management (.${name})*\n\n` +
      `• *Action:* Get full-res group profile picture\n` +
      `• *Target:* Current Group Chat\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
