/**
 * Kuzmix-MD Command: .plot
 * Category: creative
 * Description: Develop engaging story plot twists & arcs
 */

module.exports = {
  name: 'plot',
  aliases: [],
  category: 'creative',
  description: 'Develop engaging story plot twists & arcs',
  usage: '.plot time travel thriller in ancient Africa',
  example: '.plot time travel thriller in ancient Africa',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'plot';
    const desc = 'Develop engaging story plot twists & arcs';
    const syntax = '.plot time travel thriller in ancient Africa';
    const example = '.plot time travel thriller in ancient Africa';
    const nameUpper = 'PLOT';

    
    const topic = args.join(' ').trim();
    if (!topic) {
      return reply(`🎨 *AI Creative Suite (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('✨ *Composing creative output...*');

    const { ask, format } = require('../lib/aiHelper');
    try {
      const text = await ask(topic, `Task: ${desc}. Format output cleanly for WhatsApp.`);
      return reply(format(text, `KUZMIX AI: ${nameUpper}`));
    } catch (err) {
      console.warn('[AI ERROR]', err.message);
    }

    return reply(
      `╔═════『 *KUZMIX CREATIVE: ${nameUpper}* 』═════\n` +
      `🎭 *Topic:* ${topic}\n\n` +
      `"In the radiant tapestry of innovation, ${topic} shines with purpose and vision. ` +
      `Every line coded, every pulse of energy speaks to the boundless creativity of the mind."\n\n` +
      `╚══════════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );

  }
};
