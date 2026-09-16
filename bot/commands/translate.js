/**
 * Kuzmix-MD Language Translator (.tr / .translate)
 * Translates text between 100+ languages
 */

module.exports = {
  name: 'translate',
  aliases: ['tr', 'trans'],
  category: 'AI Reasoning',
  description: 'Translates text or replied messages into any world language',
  usage: '.translate [langCode] [text]',
  example: '.translate es Good morning my friend',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, msg, config } = ctx;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText =
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      quoted?.imageMessage?.caption ||
      '';

    let targetLang = 'en';
    let textToTranslate = '';

    if (args.length >= 2) {
      targetLang = args[0].toLowerCase();
      textToTranslate = args.slice(1).join(' ');
    } else if (args.length === 1 && quotedText) {
      targetLang = args[0].toLowerCase();
      textToTranslate = quotedText;
    } else if (args.length === 1) {
      textToTranslate = args[0];
    } else if (quotedText) {
      textToTranslate = quotedText;
    }

    if (!textToTranslate) {
      return reply(
        `🌐 *Kuzmix Multi-Language Translator*\n\n` +
        `Usage:\n` +
        `👉 \`${config.prefix}tr es Good morning my friend\`\n` +
        `👉 \`${config.prefix}tr fr Hello, how are you doing?\`\n` +
        `👉 \`${config.prefix}tr de Thank you very much\`\n` +
        `👉 Or reply to any foreign message with \`${config.prefix}tr en\``
      );
    }

    try {
      const { getJson } = require('../lib/httpClient');
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=autodetect|${encodeURIComponent(targetLang)}`;
      const data = await getJson(url, { timeout: 10000 });

      const match = data?.responseData?.translatedText;
      if (!match) throw new Error('Could not translate text');

      const msgOut =
        `╔═════『 *TRANSLATION (${targetLang.toUpperCase()})* 』═════\n` +
        `📝 *Original:* ${textToTranslate}\n\n` +
        `🎯 *Translation:*\n${match}\n` +
        `╚═══════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await reply(msgOut);
    } catch (err) {
      console.error('[TRANSLATE CMD ERROR]', err.message);
      await reply(`❌ *Translation failed:* ${err.message}`);
    }
  },
};
