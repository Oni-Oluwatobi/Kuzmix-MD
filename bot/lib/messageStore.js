const MAX_STORED = 200;
const MAX_SENT_IDS = 1000;
const MAX_SEEN_IDS = 1000;

class MessageStore {
  constructor() {
    this.messages = new Map();
    this.sentIds = new Set();
    this.sentOrder = [];
    this.seenIds = new Set();
    this.seenOrder = [];
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

  markSent(id) {
    if (!id || this.sentIds.has(id)) return;
    this.sentIds.add(id);
    this.sentOrder.push(id);
    if (this.sentOrder.length > MAX_SENT_IDS) {
      const old = this.sentOrder.shift();
      this.sentIds.delete(old);
    }
  }

  wasSent(id) {
    return Boolean(id) && this.sentIds.has(id);
  }

  markSeen(id) {
    if (!id) return true;
    if (this.seenIds.has(id)) return false;
    this.seenIds.add(id);
    this.seenOrder.push(id);
    if (this.seenOrder.length > MAX_SEEN_IDS) {
      const old = this.seenOrder.shift();
      this.seenIds.delete(old);
    }
    return true;
  }
}

const store = new MessageStore();

module.exports = store;
