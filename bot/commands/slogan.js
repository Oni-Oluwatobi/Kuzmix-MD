/**
 * Kuzmix-MD Command: .slogan
 * Category: creative
 * Description: Generate punchy marketing taglines & slogans
 */

module.exports = {
  name: 'slogan',
  aliases: [],
  category: 'creative',
  description: 'Generate punchy marketing taglines & slogans',
  usage: '.slogan ultra-fast cloud hosting',
  example: '.slogan ultra-fast cloud hosting',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'slogan';
    const desc = 'Generate punchy marketing taglines & slogans';
    const syntax = '.slogan ultra-fast cloud hosting';
    const example = '.slogan ultra-fast cloud hosting';
    const nameUpper = 'SLOGAN';

    
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
