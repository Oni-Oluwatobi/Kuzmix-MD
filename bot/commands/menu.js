const commandHandler = require('../handlers/commandHandler');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands', 'list'],
  category: 'System',
  description: 'Displays the custom branded command catalog & help menu',
  usage: '.menu [category|command]',
  example: '.menu pair',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const commands = Array.from(commandHandler.commands.values());
    const menuImage = 'https://i.postimg.cc/sDFBDFfd/menu.png';

    // .menu <command> — show command details
    if (args && args.length > 0) {
      const query = args[0].toLowerCase().replace(/^\./, '');
      const cmd = commandHandler.getCommand(query);

      if (cmd) {
        const aliasList = (cmd.aliases && cmd.aliases.length > 0)
          ? cmd.aliases.map(a => `\`${config.prefix}${a}\``).join(', ')
          : '_None_';

        const detailMsg =
          `╭━━━〔 *COMMAND: ${config.prefix}${cmd.name.toUpperCase()}* 〕━━━┈⊷\n` +
          `┃ 📌 *Name:* \`${config.prefix}${cmd.name}\`\n` +
          `┃ 📁 *Category:* ${(cmd.category || 'General').toUpperCase()}\n` +
          `┃ 🔒 *Permission:* ${cmd.permission || 'everyone'}\n` +
          `┃ 📝 *Description:* ${cmd.description}\n` +
          `┃ 💡 *Syntax:* \`${cmd.usage || config.prefix + cmd.name}\`\n` +
          (cmd.example ? `┃ 🧪 *Example:* \`${cmd.example}\`\n` : '') +
          `┃ 🔖 *Aliases:* ${aliasList}\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
          `> 💡 Type \`${config.prefix}menu\` to return to categories.\n` +
          `_${config.watermark}_`;

        return reply(detailMsg);
      }

      // .menu <category> — show commands in that category
      const matchingCatCommands = commands.filter(c => (c.category || '').toLowerCase().includes(query));
      if (matchingCatCommands.length > 0) {
        let catText =
          `╭━━━〔 📁 *${query.toUpperCase()}* 〕━━━┈⊷\n` +
          `┃ ◈ *Commands:* ${matchingCatCommands.length}\n` +
          `┃ ◈ *Prefix:* [ ${config.prefix} ]\n` +
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        for (const c of matchingCatCommands) {
          catText += `• *${config.prefix}${c.name}*\n  _${c.description}_ • [${c.permission || 'everyone'}]\n\n`;
        }
        catText += `> 💡 Type \`${config.prefix}menu <command>\` for details.\n` +
                   `_${config.watermark}_`;
        return reply(catText);
      }
    }

    // Default: show categories only (with thumbnail image)
    const categories = {};
    for (const cmd of commands) {
      const cat = cmd.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    let catList = '';
    const catEntries = Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]));
    for (let i = 0; i < catEntries.length; i++) {
      const [category, cmdList] = catEntries[i];
      catList += `│ ${i + 1}. *${category.toUpperCase()}* — ${cmdList.length} cmds\n`;
    }

    const caption =
      `╭━━━〔 *${config.botName.toUpperCase()} MASTER SUITE* 〕━━━┈⊷\n` +
      `┃ ◈ *Bot:* ${config.botName}\n` +
      `┃ ◈ *Dev:* ${config.developerName}\n` +
      `┃ ◈ *Prefix:* [ ${config.prefix} ]\n` +
      `┃ ◈ *Commands:* ${commands.length} across ${catEntries.length} modules\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
      `${catList}\n` +
      `╭────────────────────────┈⊷\n` +
      `│ 💡 *How to use:*\n` +
      `│ \`${config.prefix}menu <category>\` → list cmds\n` +
      `│ \`${config.prefix}menu <command>\` → cmd details\n` +
      `╰────────────────────────┈⊷\n\n` +
      `🌐 *Website:* https://the-kreadive-galaxy.web.app/\n\n` +
      `> _${config.watermark}_`;

    try {
      await sock.sendMessage(from, {
        image: { url: menuImage },
        caption,
      }, { quoted: msg });
    } catch (e) {
      await reply(caption);
    }
  },
};
