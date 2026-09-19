/**
 * Kuzmix-MD Command: .vid
 * Category: aimedia
 * Description: Generate AI video from text prompt
 */

module.exports = {
  name: 'vid',
  aliases: [],
  category: 'aimedia',
  description: 'Generate AI video from text prompt',
  usage: '.vid sports car drifting through neon rain',
  example: '.vid sports car drifting through neon rain',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const pollinations = require('../lib/pollinations');

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(
        `🎬 *AI Video Generator*\n\n` +
        `Usage: \`.vid <prompt>\`\n` +
        `Example: \`.vid sports car drifting through neon rain\`\n\n` +
        `_${config.watermark}_`
      );
    }

    await reply(`🎬 *Generating video...*\n_Prompt: ${prompt}_\n_Backend: HuggingFace (free)_\n\nThis may take 30-120 seconds...`);

    try {
      const result = await pollinations.generateVideo(prompt, {
        mode: 'free',
        backend: 'huggingface',
        hfToken: process.env.HUGGINGFACE_API_KEY || '',
      });

      if (!result.buffer || result.buffer.length < 1000) {
        throw new Error('Received empty or invalid video');
      }

      const caption =
        `🎬 *Prompt:* ${prompt}\n⚙️ *Model:* ${result.model || 'HuggingFace'}\n\n` +
        `_${config.watermark}_`;

      return await sock.sendMessage(from, { video: result.buffer, mimetype: 'video/mp4', caption }, { quoted: msg });
    } catch (err) {
      console.error('[VID CMD ERROR]', err.message);
      return reply(`⚠️ *Video generation failed:* ${err.message}\n\n_Try a shorter prompt or try again later._`);
    }
  }
};
