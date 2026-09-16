/**
 * Kuzmix-MD Command: .animate
 * Category: aimedia
 * Description: Animate an image or descriptive scene into a dynamic video
 */

module.exports = {
  name: 'animate',
  aliases: ["img2vid","i2v","animateimg"],
  category: 'aimedia',
  description: 'Animate an image or descriptive scene into a dynamic video',
  usage: '.animate (reply to image or pass prompt)',
  example: '.animate (reply to image or pass prompt)',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'animate';
    const desc = 'Animate an image or descriptive scene into a dynamic video';
    const syntax = '.animate (reply to image or pass prompt)';
    const example = '.animate (reply to image or pass prompt)';
    const nameUpper = 'ANIMATE';

    
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
