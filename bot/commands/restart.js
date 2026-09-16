/**
 * Kuzmix-MD Command: .restart
 * Category: owner
 * Description: Safely restart the Kuzmix-MD Node.js instance
 */

module.exports = {
  name: 'restart',
  aliases: [],
  category: 'owner',
  description: 'Safely restart the Kuzmix-MD Node.js instance',
  usage: '.restart',
  example: '.restart',
  permission: 'owner',

  async execute(ctx) {
    const { sock, msg, from, reply, isOwner, config } = ctx;

    if (!isOwner) {
      return reply('⛔ *Access Denied:* This command is restricted to the bot owner.');
    }

    await reply('🔄 *Restarting Kuzmix-MD...*');

    // Gracefully close the socket before exiting
    try {
      if (sock && typeof sock.end === 'function') {
        sock.end(undefined);
      }
    } catch (_) {}

    // Give the message time to send, then exit — Render/PM2 will restart
    setTimeout(() => process.exit(0), 2000);
  }
};
