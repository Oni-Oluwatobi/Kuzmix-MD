/**
 * Kuzmix-MD Command: .kimg (.kimage, .kgenerate)
 * Category: aimedia
 * Description: Generate AI images with model selection via Pollinations registry
 */

const pollinations = require('../lib/pollinations');

module.exports = {
  name: 'kimg',
  aliases: ['kimage', 'kgenerate'],
  category: 'aimedia',
  description: 'Generate AI images with model selection',
  usage: '.kimg <prompt> OR .kimg <model> <prompt>',
  example: '.kimg cyberpunk city at night\n.kimg seedream a beautiful sunset',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;

    if (!args.length) {
      return reply(
        `🎨 *AI Image Generator*\n\n` +
        `Usage: \`.kimg <prompt>\` or \`.kimg <model> <prompt>\`\n\n` +
        `*Available models:*\n` +
        Object.keys(pollinations.IMAGE_ALIASES).map(a => `• ${a}`).join('\n') + `\n\n` +
        `Example: \`.kimg cyberpunk city at night\`\n` +
        `Example: \`.kimg seedream a beautiful sunset\`\n\n` +
        `_${config.watermark}_`
      );
    }

    let preferredModel = null;
    let prompt;

    const firstArg = args[0].toLowerCase();
    if (pollinations.IMAGE_ALIASES[firstArg]) {
      preferredModel = firstArg;
      prompt = args.slice(1).join(' ').trim();
    } else {
      prompt = args.join(' ').trim();
    }

    if (!prompt) {
      return reply(
        `⚠️ *Empty prompt*\n\n` +
        `Usage: \`.kimg <prompt>\` or \`.kimg <model> <prompt>\`\n\n` +
        `_${config.watermark}_`
      );
    }

    const modelName = preferredModel
      ? pollinations.IMAGE_ALIASES[preferredModel].split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Auto';

    await reply(`🎨 *Generating image...*\n_Model: ${modelName}_`);

    try {
      const result = await pollinations.generateImage(prompt, {
        mode: config.generationMode || 'auto',
        model: preferredModel || null,
      });

      if (!result.buffer || result.buffer.length < 1000) {
        throw new Error('Received empty or invalid image');
      }

      const resolvedModelName = result.model
        ? result.model.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : modelName;

      const caption =
        `🎨 *Prompt:* ${prompt}\n` +
        `⚙️ *Model:* ${resolvedModelName}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { image: result.buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(
        `⚠️ *Image generation failed:*\n${err.message}\n\n` +
        `_Try again in a few seconds._`
      );
    }
  }
};
