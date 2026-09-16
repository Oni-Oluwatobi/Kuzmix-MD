/**
 * Kuzmix-MD Command: .features
 * Category: kuzmix
 * Description: Show all 18 feature modules and capabilities
 */

module.exports = {
  name: 'features',
  aliases: [],
  category: 'kuzmix',
  description: 'Show all 18 feature modules and capabilities',
  usage: '.features',
  example: '.features',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'features';
    const desc = 'Show all 18 feature modules and capabilities';
    const syntax = '.features';
    const example = '.features';
    const nameUpper = 'FEATURES';

    
    
    return reply(
      `╔═════『 *KUZMIX-MD 18-MODULE ARCHITECTURE* 』═════\n` +
      `1. ⚙️ System (14 cmds) - Health, status, uptime, pair\n` +
      `2. 🤖 AI Reasoning (21 cmds) - Chat, explain, summarize\n` +
      `3. 🎬 AI Media (12 cmds) - Video/FLUX.1 synthesis\n` +
      `4. 👁️ AI Vision (8 cmds) - OCR, chart & document analysis\n` +
      `5. 👨‍💻 AI Coding (14 cmds) - Architecture, regex, SQL\n` +
      `6. 🔊 AI Voice (5 cmds) - TTS, waveform speech\n` +
      `7. 🎨 AI Creative (11 cmds) - Stories, lyrics, scripts\n` +
      `8. 🖼️ Media (19 cmds) - Stickers, View-Once unwrap\n` +
      `9. 📥 Downloader (11 cmds) - MP3, YouTube, NPM, PyPI\n` +
      `10. 🌐 Internet (14 cmds) - Weather, wiki, currency\n` +
      `11. 👥 Group Admin (14 cmds) - Broadcast, tagall, links\n` +
      `12. 🛡️ Security (13 cmds) - Anti-link, anti-spam, ghost\n` +
      `13. 📊 Stats (6 cmds) - XP, levels, rank badges\n` +
      `14. 🎓 Education (10 cmds) - Math, physics, chemistry\n` +
      `15. 🎮 Fun & Games (11 cmds) - 8ball, dice, coin, roast\n` +
      `16. 🧰 Utilities (10 cmds) - Hashes, UUID, base64\n` +
      `17. 🧠 Smart Tools (6 cmds) - Reminders, tasks, notes\n` +
      `18. 👑 Owner & Dev (15 cmds) - Eval, exec, broadcast\n` +
      `╚═══════════════════════════════════════════════════\n\n` +
      `_${config.watermark}_`
    );
    

  }
};
