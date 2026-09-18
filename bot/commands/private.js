/**
 * Kuzmix-MD Command: .private
 * Category: security
 * Description: Toggle private mode — bot only responds to the owner
 */

module.exports = {
  name: 'private',
  aliases: [],
  category: 'security',
  description: 'Toggle private mode — bot only responds to owner',
  usage: '.private on/off',
  example: '.private on',
  permission: 'owner',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !['on', 'off', 'enable', 'disable'].includes(toggle)) {
      return reply(
        `╔═════『 *PRIVATE MODE* 』═════\n` +
        `🔐 *Current:* ${config.privateMode ? 'ON' : 'OFF'}\n\n` +
        `*Options:*\n` +
        `• \`.private on\` — Bot only responds to you (owner) 🔒\n` +
        `• \`.private off\` — Bot responds to everyone (default) 💬\n` +
        `╚═════════════════════════════════════`
      );
    }

    const state = toggle === 'on' || toggle === 'enable';
    config.privateMode = state;

    return reply(
      `╔═════『 *PRIVATE MODE* 』═════\n` +
      `🔐 *Status:* ${state ? 'ENABLED' : 'DISABLED'}\n` +
      `📝 *Effect:* ${state ? 'Only you (owner) can use the bot 🔒' : 'Everyone can use the bot 💬'}\n` +
      `╚═════════════════════════════════════`
    );
  }
};
