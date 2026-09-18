/**
 * Kuzmix-MD Command: .bio
 * Category: creative
 * Description: Generate professional or witty social media bios
 */

module.exports = {
  name: 'bio',
  aliases: [],
  category: 'creative',
  description: 'Generate professional or witty social media bios',
  usage: '.bio full-stack engineer and bot builder',
  example: '.bio full-stack engineer and bot builder',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;

    const name = 'bio';
    const desc = 'Generate professional or witty social media bios';
    const syntax = '.bio full-stack engineer and bot builder';
    const example = '.bio full-stack engineer and bot builder';
    const nameUpper = 'BIO';

    
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
