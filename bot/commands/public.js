/**
 * Kuzmix-MD Command: .public
 * Category: security
 * Description: Toggle public mode — allow everyone in groups and DMs
 */

module.exports = {
  name: 'public',
  aliases: [],
  category: 'security',
  description: 'Toggle public mode — everyone can use the bot in groups and DMs',
  usage: '.public on/off',
  example: '.public on',
  permission: 'owner',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !['on', 'off', 'enable', 'disable'].includes(toggle)) {
      return reply(
        `╔═════『 *PUBLIC MODE* 』═════\n` +
        `🌐 *Current:* ${config.publicMode ? 'ON' : 'OFF'}\n` +
        `🔒 *Private Mode:* ${config.privateMode ? 'ON' : 'OFF'}\n\n` +
        `*Options:*\n` +
        `• \`.public on\` — Everyone can use the bot in groups & DMs 🌐\n` +
        `• \`.public off\` — Restore safe defaults (owner-only) 🔒\n` +
        `╚═════════════════════════════════════`
      );
    }

    const state = toggle === 'on' || toggle === 'enable';
    config.publicMode = state;
    config.privateMode = !state;

    return reply(
      `╔═════『 *PUBLIC MODE* 』═════\n` +
      `🌐 *Status:* ${state ? 'ENABLED' : 'DISABLED'}\n` +
      `🔒 *Private Mode:* ${config.privateMode ? 'ON' : 'OFF'}\n` +
      `📝 *Effect:* ${state ? 'Everyone can use the bot' : 'Only you (owner) can use the bot'}\n` +
      `╚═════════════════════════════════════`
    );
  },
};
