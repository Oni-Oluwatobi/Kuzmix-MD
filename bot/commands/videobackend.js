/**
 * Kuzmix-MD Command: .videobackend
 * Category: admin
 * Description: Switch video generation backend
 */

module.exports = {
  name: 'videobackend',
  aliases: ['vbackend', 'vprovider'],
  category: 'admin',
  description: 'Switch video generation backend (huggingface/pollinations)',
  usage: '.videobackend <huggingface|pollinations>',
  example: '.videobackend pollinations',
  permission: 'owner',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const backends = {
      huggingface: {
        name: 'HuggingFace',
        key: 'HUGGINGFACE_API_KEY',
        envVal: process.env.HUGGINGFACE_API_KEY,
        models: 'Wan2.1, HunyuanVideo, Mochi, Sulphur-2',
      },
      pollinations: {
        name: 'Pollinations',
        key: 'POLLINATIONS_API_KEY',
        envVal: process.env.POLLINATIONS_API_KEY,
        models: 'Veo, Seedance, Wan, Grok Video, Nova Reel',
      },
    };

    const target = args[0]?.toLowerCase();

    if (!target || !backends[target]) {
      const current = config.videoBackend || 'huggingface';
      const cur = backends[current];
      const list = Object.keys(backends).map(b => {
        const info = backends[b];
        const hasKey = info.envVal ? '✅' : '❌';
        const active = b === current ? ' ← active' : '';
        return `• *${b}* ${hasKey} — ${info.models}${active}`;
      }).join('\n');

      return reply(
        `╔═════『 *VIDEO BACKEND* 』═════\n\n` +
        `📡 *Current:* ${cur.name}\n\n` +
        `*Backends:*\n${list}\n\n` +
        `*Usage:* \`.videobackend <name>\`\n` +
        `*Example:* \`.videobackend pollinations\`\n\n` +
        `✅ = API key set\n❌ = API key missing\n\n` +
        `_${config.watermark}_`
      );
    }

    const backend = backends[target];
    if (!backend.envVal) {
      return reply(
        `⚠️ *Missing API Key*\n\n` +
        `${backend.name} requires \`${backend.key}\` in your Render environment.\n\n` +
        `_Set it first, then switch backends._`
      );
    }

    config.videoBackend = target;
    process.env.VIDEO_BACKEND = target;

    return reply(
      `╔═════『 *VIDEO BACKEND* 』═════\n` +
      `✅ *Switched to:* ${backend.name}\n` +
      `📝 *Models:* ${backend.models}\n` +
      `╚═════════════════════════════════════`
    );
  }
};
