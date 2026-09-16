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
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;

      const buffer = await getBuffer(ttsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000,
      });

      await sock.sendMessage(
        from,
        {
          audio: buffer,
          mimetype: 'audio/mp4',
          ptt: true, // Send as voice note waveform
        },
        { quoted: msg }
      );
    } catch (err) {
      console.error('[TTS CMD ERROR]', err.message);
      await reply(`⚠️ *Failed to generate voice note:* ${err.message}`);
    }
  },
};
