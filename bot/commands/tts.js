/**
 * Kuzmix-MD Text-to-Speech Command (.tts / .say / .voice)
 * Converts text to realistic speech audio notes
 */

module.exports = {
  name: 'tts',
  aliases: ['say', 'voice', 'speak'],
  category: 'AI Voice',
  description: 'Converts written text into a spoken voice audio note',
  usage: '.tts [langCode] [text]',
  example: '.tts en Hello from Kuzmix Multi-Device',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;

    if (args.length === 0) {
      return reply(
        `🔊 *Kuzmix Text-to-Speech (TTS)*\n\n` +
        `Usage:\n` +
        `👉 \`${config.prefix}tts Hello world, welcome to Kuzmix!\`\n` +
        `👉 \`${config.prefix}tts es Hola amigo como estas\`\n` +
        `👉 \`${config.prefix}tts fr Bonjour tout le monde\``
      );
    }

    let lang = 'en';
    let text = args.join(' ');

    // Check if first arg is a 2-letter language code
    if (args[0].length === 2 && args.length > 1) {
      lang = args[0].toLowerCase();
      text = args.slice(1).join(' ');
    }

    if (text.length > 300) {
      return reply('⚠️ Text exceeds maximum length of 300 characters for voice conversion.');
    }

    await reply('🎙️ *Synthesizing voice audio note...*');

    try {
      const { getBuffer } = require('../lib/httpClient');
      const { toWhatsAppVoice, looksLikeAudio, detectAudioMime } = require('../lib/voice');
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;

      const buffer = await getBuffer(ttsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000,
      });

      if (!looksLikeAudio(buffer)) {
        return reply('⚠️ *Failed to generate voice note:* TTS returned non-audio data.');
      }

      // WhatsApp voice notes must be OGG/Opus. Raw MP3 with ptt:true shows up
      // as an undecodable "empty" voice note ("cannot play this audio file").
      let payload;
      try {
        const voice = await toWhatsAppVoice(buffer);
        payload = { audio: voice.buffer, mimetype: voice.mimetype, ptt: true };
      } catch (_) {
        payload = { audio: buffer, mimetype: detectAudioMime(buffer), ptt: false };
      }

      await sock.sendMessage(from, payload, { quoted: msg });
    } catch (err) {
      console.error('[TTS CMD ERROR]', err.message);
      await reply(`⚠️ *Failed to generate voice note:* ${err.message}`);
    }
  },
};
