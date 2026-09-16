/**
 * Kuzmix-MD Command: .unknown
 * Category: security
 * Description: Toggle private response routing mode across all WhatsApp groups
 */

module.exports = {
  name: 'unknown',
  aliases: ["private","ghost"],
  category: 'security',
  description: 'Toggle private response routing mode across all WhatsApp groups',
  usage: '.unknown on',
  example: '.unknown on',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'unknown';
    const desc = 'Toggle private response routing mode across all WhatsApp groups';
    const syntax = '.unknown on';
    const example = '.unknown on';
    const nameUpper = 'UNKNOWN';

    
    const toggle = args[0]?.toLowerCase();
    const state = toggle === 'on' || toggle === 'enable' || toggle === '1';
    
    const mode = state ? 'private' : toggle === 'off' ? 'silent' : (config.unknownCommandMode === 'private' ? 'silent' : 'private');
    config.unknownCommandMode = mode;
    return reply(
      `╔═════『 *UNKNOWN COMMAND MODE* 』═════\n` +
      `🛡️ *Current Mode:* ${mode.toUpperCase()}\n` +
      `📝 *Routing:* ${mode === 'private' ? 'Forwarded privately to user DM 🔒' : 'Silent / Local suppression 🔕'}\n` +
      `╚═════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
