/**
 * Kuzmix-MD Command: .story
 * Category: creative
 * Description: Generate an immersive fictional story
 */

module.exports = {
  name: 'story',
  aliases: [],
  category: 'creative',
  description: 'Generate an immersive fictional story',
  usage: '.story a rogue AI exploring cyberspace',
  example: '.story a rogue AI exploring cyberspace',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const name = 'story';
    const desc = 'Generate an immersive fictional story';
    const syntax = '.story a rogue AI exploring cyberspace';
    const example = '.story a rogue AI exploring cyberspace';
    const nameUpper = 'STORY';

    
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
