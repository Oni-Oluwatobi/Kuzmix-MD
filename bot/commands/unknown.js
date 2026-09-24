/**
 * Kuzmix-MD Command: .unknown
 * Category: security
 * Description: Toggle DM-only mode for ALL bot responses
 */

module.exports = {
  name: 'unknown',
  aliases: ['ghost'],
  category: 'security',
  description: 'Toggle DM-only mode — all bot responses go to your DM, nothing shows in chat',
  usage: '.unknown on/off',
  example: '.unknown on',
  permission: 'owner',

  async execute(ctx) {
    const { reply, replyDM, args, config } = ctx;

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !['on', 'off', 'enable', 'disable'].includes(toggle)) {
      const isOn = config.unknownCommandMode === 'private';
      return reply(
        `╔═════『 *DM-ONLY MODE* 』═════\n` +
        `🔒 *Current:* ${isOn ? 'ON' : 'OFF'} (${config.unknownCommandMode || 'silent'})\n\n` +
        `*What it does:*\n` +
        `• *ON* — Every bot response goes to your DM only. Nothing appears in group/chat.\n` +
        `• *OFF* — Bot responds normally in chat (unknown commands stay silent).\n\n` +
        `*Options:*\n` +
        `• \`.unknown on\` — Enable DM-only mode 🔒\n` +
        `• \`.unknown off\` — Disable DM-only mode 💬\n` +
        `╚═════════════════════════════════════`
      );
    }

    const state = toggle === 'on' || toggle === 'enable';
    config.unknownCommandMode = state ? 'private' : 'silent';

    // Send confirmation directly to DM so it's always visible
    const confirmMsg =
      `╔═════『 *DM-ONLY MODE* 』═════\n` +
      `🔒 *Mode:* ${state ? 'ENABLED' : 'DISABLED'}\n` +
      `📝 *Effect:* ${state ? 'All bot responses now go to your DM only' : 'Bot responds normally in chat; unknown commands are silent'}\n` +
      `╚═════════════════════════════════════`;

    if (replyDM) {
      await replyDM(confirmMsg);
    } else {
      await reply(confirmMsg);
    }
  }
};
