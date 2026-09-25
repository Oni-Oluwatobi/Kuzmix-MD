/**
 * Suppresses raw console noise from the `libsignal` dependency.
 *
 * libsignal calls console.log/info/warn directly (bypassing the pino logger),
 * dumping full SessionEntry objects — INCLUDING private keys — into the logs.
 * These messages are benign session-bookkeeping, not actionable errors.
 */

const NOISE_PREFIXES = [
  'Closing session:',
  'Closing open session',
  'Closing stale open session',
  'Opening session:',
  'Removing old closed session',
  'Migrating session to:',
  'Session already closed',
  'Decrypted message with closed session',
  'Failed to decrypt message with any known session',
  'No session found to decrypt message',
  'Session error:',
];

function looksLikeSessionDump(value) {
  if (!value || typeof value !== 'object') return false;
  // libsignal SessionEntry shape (also catches minified/bare-object logs
  // that carry no recognizable prefix -- and contain private keys)
  return !!(value.currentRatchet || value._chains || value.indexInfo);
}

function isNoise(args) {
  const first = args[0];
  if (typeof first === 'string' && NOISE_PREFIXES.some(p => first.startsWith(p))) {
    return true;
  }
  for (const arg of args) {
    if (looksLikeSessionDump(arg)) return true;
  }
  return false;
}

let installed = false;

function install() {
  if (installed) return;
  installed = true;
  for (const method of ['log', 'info', 'warn', 'error']) {
    const original = console[method].bind(console);
    console[method] = (...args) => {
      if (isNoise(args)) return;
      original(...args);
    };
  }
}

install();

module.exports = { install, isNoise };
