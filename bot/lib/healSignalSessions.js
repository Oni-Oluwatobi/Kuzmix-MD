const fs = require('fs');
const path = require('path');

/**
 * Removes persisted signal session records (session-<id>.json) for a Baileys
 * multi-file auth directory, forcing every 1:1 session to be rebuilt fresh
 * on next contact.
 *
 * Why: signal sessions are ratchets. If two sockets ever run the same account
 * (or a session desyncs), the persisted ratchet state stays poisoned across
 * restarts -- the phone then shows "Waiting for this message" forever.
 * Rebuilding from a fresh prekey bundle heals this without re-pairing.
 *
 * Deliberately KEPT: creds.json, pre-key-*, signal-identity-*,
 * app-state-sync-*, sender-key-* (group keys; deleting them would blind the
 * bot to group messages until participants re-distribute).
 */
function purgeSignalSessions(sessionDir) {
  let removed = 0;
  try {
    if (!sessionDir || !fs.existsSync(sessionDir)) return 0;
    for (const name of fs.readdirSync(sessionDir)) {
      if (!name.startsWith('session-') || !name.endsWith('.json')) continue;
      const file = path.join(sessionDir, name);
      try {
        if (fs.statSync(file).isFile()) {
          fs.unlinkSync(file);
          removed += 1;
        }
      } catch (_) { /* another writer may have removed it already */ }
    }
  } catch (_) { /* never let healing break session startup */ }
  return removed;
}

module.exports = { purgeSignalSessions };
