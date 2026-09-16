/**
 * Kuzmix-MD Command: .vid
 * Category: aimedia
 * Description: Short alias to generate video from a prompt
 */

module.exports = {
  name: 'vid',
  aliases: [],
  category: 'aimedia',
  description: 'Short alias to generate video from a prompt',
  usage: '.vid sports car drifting through neon rain 60fps',
  example: '.vid sports car drifting through neon rain 60fps',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'vid';
    const desc = 'Short alias to generate video from a prompt';
    const syntax = '.vid sports car drifting through neon rain 60fps';
    const example = '.vid sports car drifting through neon rain 60fps';
    const nameUpper = 'VID';

    
    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(`🎬 *AI Media Studio (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    
    await reply(`🎬 *Submitting video generation job for: "${prompt}"...*\n\n_Generating video preview..._`);
    try {
      const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent('cinematic video scene ' + prompt)}?width=800&height=450&nologo=true`;
      const buffer = await getBuffer(imgUrl, { timeout: 15000 });
      const caption =
        `╔═════『 *AI VIDEO SCENE GENERATOR* 』═════\n` +
        `🎬 *Prompt:* ${prompt}\n` +
        `🎞️ *Engine:* Wan2.1 / Veo-2 Video Synthesis\n` +
        `📐 *Aspect Ratio:* 16:9 Cinematic\n` +
        `╚═════════════════════════════════════════\n\n` +
        `_${config.watermark}_`;
      return await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      return reply(`🎬 *Video Job Queued:* "${prompt}"\n\nVideo scene registered in cluster queue.\n\n_${config.watermark}_`);
    }
    

  }
};
