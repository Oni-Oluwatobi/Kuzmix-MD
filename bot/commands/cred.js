module.exports = {
  name: 'cred',
  aliases: ['credits', 'license', 'security'],
  category: 'General',
  description: 'Displays bot credits, version information, and security status',
  usage: '.cred',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;

    const credText =
      `🛡️ *${config.botName} CREDITS & SECURITY AUDIT*\n\n` +
      `• *Core Engine:* @whiskeysockets/baileys Multi-Device\n` +
      `• *Architecture:* 3-Tier Isolated (Admin / Pairing / Bot)\n` +
      `• *Security:* Isolated Noise-IK auth, zero browser key leaks\n` +
      `• *Author:* ${config.developerName} (${config.organization})\n` +
      `• *License:* MIT\n\n` +
      `_Session storage is encrypted and protected in KUZMIX_AUTH_DIR._`;

    await reply(credText);
  },
};
