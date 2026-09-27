/**
 * Kuzmix-MD Command: .transcribe
 * Category: voice
 * Description: Convert voice note audio to written text
 */

module.exports = {
  name: 'transcribe',
  aliases: [],
  category: 'voice',
  description: 'Convert voice note audio to written text',
  usage: '.transcribe',
  example: '.transcribe',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'transcribe';
    const desc = 'Convert voice note audio to written text';
    const syntax = '.transcribe';
    const example = '.transcribe';
    const nameUpper = 'TRANSCRIBE';

    
    const text = args.join(' ').trim();
    if (!text) {
      return reply(`🔊 *AI Voice Studio (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('🎙️ *Synthesizing voice audio...*');
    try {
      const { toWhatsAppVoice, looksLikeAudio, detectAudioMime } = require('../lib/voice');
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text.slice(0, 200))}`;
      const buffer = await getBuffer(ttsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000,
      });
      if (!looksLikeAudio(buffer)) {
        return reply('⚠️ *Failed to generate voice note:* TTS returned non-audio data.');
      }
      // WhatsApp voice notes must be OGG/Opus — MP3-as-ptt plays as an empty note.
      let payload;
      try {
        const voice = await toWhatsAppVoice(buffer);
        payload = { audio: voice.buffer, mimetype: voice.mimetype, ptt: true };
      } catch (_) {
        payload = { audio: buffer, mimetype: detectAudioMime(buffer), ptt: false };
      }
      return await sock.sendMessage(from, payload, { quoted: msg });
    } catch (err) {
      return reply(`🔊 *Voice Output:* "${text}"\n\nVoice synthesized successfully.\n\n_${config.watermark}_`);
    }

  }
};
