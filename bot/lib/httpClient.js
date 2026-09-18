/**
 * Universal HTTP Client for Kuzmix-MD
 * Prefers native global fetch (Node 18+), falls back to axios or https
 */

async function getJson(url, options = {}) {
  const timeoutMs = options.timeout || 10000;
  const headers = options.headers || {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Kuzmix-MD/1.0',
    'Accept': 'application/json, text/plain, */*',
  };

  if (typeof fetch !== 'undefined') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  // Fallback to axios if available
  try {
    const axios = require('axios');
    const res = await axios.get(url, { headers, timeout: timeoutMs });
    return res.data;
  } catch (axiosErr) {
    throw axiosErr;
  }
}

async function getBuffer(url, options = {}) {
  const timeoutMs = options.timeout || 12000;
  const headers = options.headers || {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Kuzmix-MD/1.0',
  };

  if (typeof fetch !== 'undefined') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  try {
    const axios = require('axios');
    const res = await axios.get(url, { headers, responseType: 'arraybuffer', timeout: timeoutMs });
    return Buffer.from(res.data);
  } catch (axiosErr) {
    throw axiosErr;
  }
}

async function postJson(url, body, options = {}) {
  const timeoutMs = options.timeout || 30000;
  const headers = options.headers || {
    'Content-Type': 'application/json',
  };

  if (typeof fetch !== 'undefined') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  try {
    const axios = require('axios');
    const res = await axios.post(url, body, { headers, timeout: timeoutMs });
    return res.data;
  } catch (axiosErr) {
    throw axiosErr;
  }
}

module.exports = {
  getJson,
  getBuffer,
  postJson,
};
