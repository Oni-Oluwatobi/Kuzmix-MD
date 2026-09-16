const fs = require('fs');
const path = require('path');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanPhoneNumber(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function isSessionValid(sessionDir) {
  if (!fs.existsSync(sessionDir)) return false;
  const credsPath = path.join(sessionDir, 'creds.json');
  if (!fs.existsSync(credsPath)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    return Boolean(data && data.me && data.me.id);
  } catch {
    return false;
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

module.exports = {
  delay,
  cleanPhoneNumber,
  isSessionValid,
  formatUptime,
};
