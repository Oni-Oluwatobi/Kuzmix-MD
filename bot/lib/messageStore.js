const MAX_STORED = 200;

class MessageStore {
  constructor() {
    this.messages = new Map();
  }

  track(chatJid, msgKey) {
    if (!chatJid || !msgKey) return;
    if (!this.messages.has(chatJid)) {
      this.messages.set(chatJid, []);
    }
    const list = this.messages.get(chatJid);
    list.push(msgKey);
    if (list.length > MAX_STORED) {
      list.splice(0, list.length - MAX_STORED);
    }
  }

  get(chatJid, limit) {
    const list = this.messages.get(chatJid) || [];
    return list.slice(-(limit || MAX_STORED));
  }

  clear(chatJid) {
    const list = this.messages.get(chatJid) || [];
    this.messages.delete(chatJid);
    return list;
  }
}

const store = new MessageStore();

module.exports = store;
