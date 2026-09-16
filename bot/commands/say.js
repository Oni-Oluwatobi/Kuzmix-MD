/**
 * Kuzmix-MD Command: .say
 * Category: voice
 * Description: Speak text as a WhatsApp voice note via TTS (Google fallback StreamElements)
 */

module.exports = {
  name: 'say',
  aliases: [],
  category: 'voice',
  description: 'Speak text in WhatsApp voice waveform',
  usage: '.say Hello from Nigeria',
  example: '.say Hello from Nigeria',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;
    const { getBuffer } = require('../lib/httpClient');
    const name = 'say';
    const syntax = '.say Hello from Nigeria';
    const example = '.say Hello from Nigeria';

    const text = args.join(' ').trim();
    if (!text) {
      return reply(`🔊 *AI Voice Studio (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    // Guard: long inputs can exceed TTS API limits
    if (text.length > 200) {
      return reply(`⚠️ *Text too long.* Keep your message under 200 characters for clear speech synthesis.`);
    }

    await reply('🎙️ *Synthesizing voice audio...*');

    const sources = [
      {
        name: 'Google Translate TTS',
        url: `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
          'Accept': 'audio/mp3,audio/*;q=0.9,*/*;q=0.8',
        },
      },
      {
        name: 'StreamElements TTS',
        url: `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
        },
      },
    ];

    let lastError = null;
    for (const source of sources) {
      try {
        const buffer = await getBuffer(source.url, {
          headers: source.headers,
          timeout: 15000,
        });

        if (!buffer || buffer.length < 100) {
          throw new Error('TTS returned an empty audio buffer.');
        }

        return await sock.sendMessage(
          from,
          { audio: buffer, mimetype: 'audio/mpeg', ptt: true },
          { quoted: msg }
        );
      } catch (err) {
        lastError = err;
        console.warn(`[SAY] ${source.name} failed, trying next source:`, err.message);
      }
    }

    return reply(
      `❌ *Voice synthesis unavailable.*\n\n` +
      `Both TTS providers rejected the request (${lastError ? lastError.message : 'network error'}).\n` +
      `This can happen when the server IP is rate-limited. Try again in a few minutes, or use \`${config.prefix}tts <text>\` with a shorter message.\n\n` +
      `_${config.watermark}_`
    );
  }
};