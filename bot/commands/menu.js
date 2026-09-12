const commandHandler = require('../handlers/commandHandler');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands', 'list'],
  category: 'General',
  description: 'Displays the custom branded command catalog & help menu',
  usage: '.menu',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, config } = ctx;
    const commands = Array.from(commandHandler.commands.values());

    const categories = {};
    for (const cmd of commands) {
      const cat = cmd.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    let menuText =
      `*═════ ❖ ${config.botName.toUpperCase()} MENU ❖ ═════*\n\n` +
      `• *Prefix:* \`${config.prefix}\`\n` +
      `• *Developer:* ${config.developerName}\n` +
      `• *Total Commands:* ${commands.length}\n\n`;

    for (const [category, cmdList] of Object.entries(categories)) {
      menuText += `*┌─〔 ${category.toUpperCase()} 〕*\n`;
      for (const cmd of cmdList) {
        menuText += `│ • \`${config.prefix}${cmd.name}\` - _${cmd.description}_\n`;
      }
      menuText += `*└──────────────*\n\n`;
    }

    menuText += `_Type \`${config.prefix}alive\` for system stats._\n${config.watermark}`;

    await reply(menuText);
  },
};
