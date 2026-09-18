/**
 * Kuzmix-MD Command: .name
 * Category: creative
 * Description: Generate unique names for apps, brands, or characters
 */

module.exports = {
  name: 'name',
  aliases: [],
  category: 'creative',
  description: 'Generate unique names for apps, brands, or characters',
  usage: '.name futuristic fintech platform',
  example: '.name futuristic fintech platform',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'name';
    const desc = 'Generate unique names for apps, brands, or characters';
    const syntax = '.name futuristic fintech platform';
    const example = '.name futuristic fintech platform';
    const nameUpper = 'NAME';

    
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
