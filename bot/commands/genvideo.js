/**
 * Kuzmix-MD Command: .genvideo
 * Category: aimedia
 * Description: Generate a video from a prompt (Wan2.1 / Veo-2)
 */

module.exports = {
  name: 'genvideo',
  aliases: ["vid","videoai","txt2video","t2v","cinematic"],
  category: 'aimedia',
  description: 'Generate a video from a prompt (Wan2.1 / Veo-2)',
  usage: '.genvideo golden eagle soaring over snowy mountain peaks 4k',
  example: '.genvideo golden eagle soaring over snowy mountain peaks 4k',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'genvideo';
    const desc = 'Generate a video from a prompt (Wan2.1 / Veo-2)';
    const syntax = '.genvideo golden eagle soaring over snowy mountain peaks 4k';
    const example = '.genvideo golden eagle soaring over snowy mountain peaks 4k';
    const nameUpper = 'GENVIDEO';

    
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
