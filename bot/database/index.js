/**
 * Kuzmix-MD Local Persistence Database
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.KUZMIX_DB_PATH || path.join(process.cwd(), 'database', 'kuzmix-db.json');

class Database {
  constructor(filePath = DB_PATH) {
    this.filePath = filePath;
    this.data = {
      users: {},
      groups: {},
      settings: {},
      commandStats: {},
    };
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[KUZMIX DB] Error initializing database:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[KUZMIX DB] Error saving database:', err.message);
    }
  }

  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
    return value;
  }

  incrementCommandStat(commandName) {
    if (!this.data.commandStats) this.data.commandStats = {};
    this.data.commandStats[commandName] = (this.data.commandStats[commandName] || 0) + 1;
    this.save();
  }
}

module.exports = new Database();
