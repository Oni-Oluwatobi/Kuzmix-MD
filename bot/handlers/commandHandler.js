const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
  }

  loadCommands(commandsDir = path.join(__dirname, '..', 'commands')) {
    this.commands.clear();
    this.aliases.clear();

    if (!fs.existsSync(commandsDir)) return;

    const files = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const fullPath = path.join(commandsDir, file);
      try {
        delete require.cache[require.resolve(fullPath)];
        const cmd = require(fullPath);
        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') continue;

        const cmdName = cmd.name.toLowerCase();
        this.commands.set(cmdName, cmd);

        if (Array.isArray(cmd.aliases)) {
          for (const alias of cmd.aliases) {
            this.aliases.set(alias.toLowerCase(), cmdName);
          }
        }
        console.log(`[KUZMIX] Loaded command: .${cmdName}`);
      } catch (err) {
        console.error(`[KUZMIX] Error loading ${file}:`, err.message);
      }
    }
  }

  getCommand(trigger) {
    if (!trigger) return null;
    const clean = trigger.toLowerCase();
    if (this.commands.has(clean)) return this.commands.get(clean);
    if (this.aliases.has(clean)) return this.commands.get(this.aliases.get(clean));
    return null;
  }
}

module.exports = new CommandHandler();
