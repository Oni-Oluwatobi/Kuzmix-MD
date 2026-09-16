/**
 * Kuzmix-MD Command: .vidstyle
 * Category: aimedia
 * Description: Choose, inspect, and configure cinematic video styles
 */

module.exports = {
  name: 'vidstyle',
  aliases: ["videostyle","vstyle"],
  category: 'aimedia',
  description: 'Choose, inspect, and configure cinematic video styles',
  usage: '.vidstyle cinematic (or vidstyle list)',
  example: '.vidstyle cinematic (or vidstyle list)',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'vidstyle';
    const desc = 'Choose, inspect, and configure cinematic video styles';
    const syntax = '.vidstyle cinematic (or vidstyle list)';
    const example = '.vidstyle cinematic (or vidstyle list)';
    const nameUpper = 'VIDSTYLE';

    
    const prompt = args.join(' ').trim();
    if (!prompt) {
      return reply(`🎬 *AI Media Studio (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    
    return reply(
      `╔═════『 *AI VIDEO STYLES CATALOG* 』═════\n` +
      `1. *Cinematic 4K:* Ultra-wide angle, anamorphic lens, realistic lighting\n` +
      `2. *Cyberpunk Neon:* High contrast, reflective rain, neon glow\n` +
      `3. *Anime Action:* Japanese dynamic framing, high frame-rate\n` +
      `4. *Hyper-Realistic Nature:* Macro lens 85mm, natural sunlight\n` +
      `5. *3D Pixar/DreamWorks:* Soft ambient occlusion, vibrant textures\n` +
      `╚════════════════════════════════════════\n\n` +
      `_Usage: \`${config.prefix}vidstyle cinematic\`_\n` +
      `_${config.watermark}_`
    );
    

  }
};
