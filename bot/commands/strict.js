/**
 * Kuzmix-MD Command: .strict
 * Category: security
 * Description: Toggle strict command mode (exact commands only)
 */

module.exports = {
  name: 'strict',
  aliases: [],
  category: 'security',
  description: 'Toggle strict command mode — exact prefixed commands only',
  usage: '.strict on/off',
  example: '.strict on',
  permission: 'owner',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !['on', 'off', 'enable', 'disable'].includes(toggle)) {
      return reply(
        `╔═════『 *STRICT MODE* 』═════\n` +
        `🎯 *Current:* ${config.strictMode ? 'ON' : 'OFF'}\n\n` +
        `*What it does:*\n` +
        `• *ON* — Only \`${config.prefix}command\` syntax works. No fuzzy matching.\n` +
        `• *OFF* — Bare command names also work (exact whole-message match only).\n\n` +
        `*Options:*\n` +
        `• \`.strict on\` — Exact commands only 🎯\n` +
        `• \`.strict off\` — Also allow bare command names\n` +
        `╚═════════════════════════════════════`
      );
    }

    const state = toggle === 'on' || toggle === 'enable';
    config.strictMode = state;

    return reply(
      `╔═════『 *STRICT MODE* 』═════\n` +
      `🎯 *Status:* ${state ? 'ENABLED' : 'DISABLED'}\n` +
      `📝 *Effect:* ${state ? `Only \`${config.prefix}command\` syntax works` : 'Bare command names also work (exact match only)'}\n` +
      `╚═════════════════════════════════════`
    );
  },
};
