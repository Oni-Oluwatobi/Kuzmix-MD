/**
 * Kuzmix-MD Command: .unknown
 * Category: security
 * Description: Toggle how unknown commands are handled
 */

module.exports = {
  name: 'unknown',
  aliases: ['ghost'],
  category: 'security',
  description: 'Toggle unknown command response mode',
  usage: '.unknown on/off',
  example: '.unknown on',
  permission: 'owner',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const toggle = args[0]?.toLowerCase();
    if (!toggle || !['on', 'off', 'enable', 'disable'].includes(toggle)) {
      return reply(
        `╔═════『 *UNKNOWN COMMAND MODE* 』═════\n` +
        `🛡️ *Current:* ${config.unknownCommandMode.toUpperCase()}\n\n` +
        `*Options:*\n` +
        `• \`.unknown on\` — Send unknown command responses to user DM 🔒\n` +
        `• \`.unknown off\` — Show responses in chat (default) 💬\n` +
        `╚═════════════════════════════════════`
      );
    }

    const state = toggle === 'on' || toggle === 'enable';
    config.unknownCommandMode = state ? 'private' : 'notify';

    return reply(
      `╔═════『 *UNKNOWN COMMAND MODE* 』═════\n` +
      `🛡️ *Mode:* ${config.unknownCommandMode.toUpperCase()}\n` +
      `📝 *Effect:* ${state ? 'Unknown command responses go to your DM 🔒' : 'Responses shown in chat 💬'}\n` +
      `╚═════════════════════════════════════`
    );
  }
};
