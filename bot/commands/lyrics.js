/**
 * Kuzmix-MD Command: .lyrics
 * Category: creative
 * Description: Generate original song lyrics with verses & chorus
 */

module.exports = {
  name: 'lyrics',
  aliases: [],
  category: 'creative',
  description: 'Generate original song lyrics with verses & chorus',
  usage: '.lyrics upbeat afro-pop anthem',
  example: '.lyrics upbeat afro-pop anthem',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'lyrics';
    const desc = 'Generate original song lyrics with verses & chorus';
    const syntax = '.lyrics upbeat afro-pop anthem';
    const example = '.lyrics upbeat afro-pop anthem';
    const nameUpper = 'LYRICS';

    
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
