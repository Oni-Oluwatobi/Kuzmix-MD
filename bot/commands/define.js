/**
 * Kuzmix-MD Dictionary Definition Command (.define / .dict / .meaning)
 * Looks up definitions, pronunciation, and examples
 */

module.exports = {
  name: 'define',
  aliases: ['dict', 'dictionary', 'meaning'],
  category: 'Education',
  description: 'Looks up the definition, phonetics, and usage of any English word',
  usage: '.define [word]',
  example: '.define serendipity',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const word = args[0]?.trim();
    if (!word) {
      return reply(
        `📖 *Kuzmix English Dictionary*\n\n` +
        `Please specify a word to look up:\n` +
        `👉 \`${config.prefix}define resilience\`\n` +
        `👉 \`${config.prefix}define serendipity\`\n` +
        `👉 \`${config.prefix}define ephemeral\``
      );
    }

    try {
      const { getJson } = require('../lib/httpClient');
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const data = await getJson(url, { timeout: 10000 });

      const entry = data?.[0];
      if (!entry) throw new Error('Word not found');

      const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
      let definitionsText = '';

      if (entry.meanings && entry.meanings.length > 0) {
        entry.meanings.slice(0, 3).forEach((meaning, i) => {
          const partOfSpeech = meaning.partOfSpeech ? `*(${meaning.partOfSpeech})*` : '';
          const def = meaning.definitions?.[0]?.definition || '';
          const example = meaning.definitions?.[0]?.example ? `\n   _Example:_ "${meaning.definitions[0].example}"` : '';
          definitionsText += `\n${i + 1}. ${partOfSpeech} ${def}${example}`;
        });
      }

      const msg =
        `╔═════『 *DICTIONARY: ${entry.word.toUpperCase()}* 』═════\n` +
        (phonetic ? `🗣️ *Pronunciation:* ${phonetic}\n` : '') +
        definitionsText +
        `\n╚══════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await reply(msg);
    } catch (err) {
      console.error('[DEFINE CMD ERROR]', err.message);
      await reply(
        `❌ *Could not find definition for "${word}"*\n` +
        `Please check the spelling or try another word.\n` +
        `_Example: \`${config.prefix}define ubiquitous\`_`
      );
    }
  },
};
