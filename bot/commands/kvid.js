/**
 * Kuzmix-MD Command: .kvid (.kvideo, .kclip)
 * Category: aimedia
 * Description: Generate AI videos with model selection via Pollinations registry
 */

const pollinations = require('../lib/pollinations');

module.exports = {
  name: 'kvid',
  aliases: ['kvideo', 'kclip'],
  category: 'aimedia',
  description: 'Generate AI videos with model selection',
  usage: '.kvid <prompt> OR .kvid <model> <prompt>',
  example: '.kvid ocean waves crashing at sunset\n.kvid seedance a cat playing piano',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;

    if (!args.length) {
      return reply(
        `🎬 *AI Video Generator*\n\n` +
        `Usage: \`.kvid <prompt>\` or \`.kvid <model> <prompt>\`\n\n` +
        `*Available models:*\n` +
        Object.keys(pollinations.VIDEO_ALIASES).map(a => `• ${a}`).join('\n') + `\n\n` +
        `Example: \`.kvid ocean waves crashing at sunset\`\n` +
        `Example: \`.kvid seedance a cat playing piano\`\n\n` +
        `_${config.watermark}_`
      );
    }

    let preferredModel = null;
    let prompt;

    const firstArg = args[0].toLowerCase();
    if (pollinations.VIDEO_ALIASES[firstArg]) {
      preferredModel = firstArg;
      prompt = args.slice(1).join(' ').trim();
    } else {
      prompt = args.join(' ').trim();
    }

    if (!prompt) {
      return reply(
        `⚠️ *Empty prompt*\n\n` +
        `Usage: \`.kvid <prompt>\` or \`.kvid <model> <prompt>\`\n\n` +
        `_${config.watermark}_`
      );
    }

    const modelName = preferredModel
      ? pollinations.VIDEO_ALIASES[preferredModel].split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Auto';

    await reply(`🎬 *Generating video...*\n_Model: ${modelName}_\n_This may take 30-60 seconds..._`);

    try {
      const result = await pollinations.generateVideo(prompt, {
        mode: config.generationMode || 'auto',
        model: preferredModel || null,
      });

      if (!result.buffer || result.buffer.length < 1000) {
        throw new Error('Received empty or invalid video');
      }

      const resolvedModelName = result.model
        ? result.model.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : modelName;

      const caption =
        `🎬 *Prompt:* ${prompt}\n` +
        `⚙️ *Model:* ${resolvedModelName}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { video: result.buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(
        `⚠️ *Video generation failed:*\n${err.message}\n\n` +
        `_Try again in a few seconds._`
      );
    }
  }
};
