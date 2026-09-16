/**
 * Kuzmix-MD Command: .chart
 * Category: vision
 * Description: Analyze data from a chart or graph
 */

module.exports = {
  name: 'chart',
  aliases: [],
  category: 'vision',
  description: 'Analyze data from a chart or graph',
  usage: '.chart',
  example: '.chart',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'chart';
    const desc = 'Analyze data from a chart or graph';
    const syntax = '.chart';
    const example = '.chart';
    const nameUpper = 'CHART';

    
    const query = args.join(' ').trim() || 'Analyze data from a chart or graph';
    return reply(
      `👁️ *AI Vision Studio (.${name})*\n\n` +
      `• *Action:* Analyze data from a chart or graph\n` +
      `• *Instructions:* Reply to any image or send an image with caption \`${config.prefix}${name}\` to analyze with multi-modal AI.\n\n` +
      `_${config.watermark}_`
    );

  }
};
