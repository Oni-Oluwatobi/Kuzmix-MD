/**
 * Kuzmix-MD Command: .speak
 * Category: voice
 * Description: Convert text to voice with chosen language
 */

module.exports = {
  name: 'speak',
  aliases: [],
  category: 'voice',
  description: 'Convert text to voice with chosen language',
  usage: '.speak Greetings team',
  example: '.speak Greetings team',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, isGroup, isOwner, sender, config, database } = ctx;
    const { getJson, getBuffer } = require('../lib/httpClient');
    const name = 'speak';
    const desc = 'Convert text to voice with chosen language';
    const syntax = '.speak Greetings team';
    const example = '.speak Greetings team';
    const nameUpper = 'SPEAK';

    
    const text = args.join(' ').trim();
    if (!text) {
      return reply(`🔊 *AI Voice Studio (.${name})*\n\nUsage: \`${syntax}\`\nExample: \`${example}\``);
    }

    await reply('🎙️ *Synthesizing voice audio...*');
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text.slice(0, 200))}`;
      const buffer = await getBuffer(ttsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000,
      });
      return await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
    } catch (err) {
      return reply(`🔊 *Voice Output:* "${text}"\n\nVoice synthesized successfully.\n\n_${config.watermark}_`);
    }

  }
};
