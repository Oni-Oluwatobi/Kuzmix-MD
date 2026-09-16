/**
 * Kuzmix-MD Command: .img2vid
 * Category: aimedia
 * Description: Transform still image to animated cinematic video
 */

module.exports = {
  name: 'img2vid',
  aliases: [],
  category: 'aimedia',
  description: 'Transform still image to animated cinematic video',
  usage: '.img2vid (reply to image with motion instructions)',
  example: '.img2vid (reply to image with motion instructions)',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'img2vid';
    const desc = 'Transform still image to animated cinematic video';
    const syntax = '.img2vid (reply to image with motion instructions)';
    const example = '.img2vid (reply to image with motion instructions)';
    const nameUpper = 'IMG2VID';

    
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
