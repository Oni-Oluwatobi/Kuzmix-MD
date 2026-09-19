/**
 * Kuzmix-MD AI Command (.ai / .ask / .gpt)
 * Uses OpenRouter API with top-tier models
 */

module.exports = {
  name: 'ai',
  aliases: ['ask', 'gpt', 'gemini', 'chat'],
  category: 'AI Reasoning',
  description: 'Asks AI questions, explains concepts, or assists with coding',
  usage: '.ai [your question or prompt]',
  example: '.ai explain how neural networks learn',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, msg, config } = ctx;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText =
      quoted?.conversation ||
      quoted?.extendedTextMessage?.text ||
      quoted?.imageMessage?.caption ||
      '';

    let prompt = args.join(' ').trim();
    if (!prompt && quotedText) {
      prompt = `Regarding this message: "${quotedText}"`;
    }

    if (!prompt) {
      return reply(
        `🤖 *${config.botName} AI Assistant*\n\n` +
        `Ask any question, request code, or get explanations:\n` +
        `👉 \`${config.prefix}ai explain quantum computing in simple terms\`\n` +
        `👉 \`${config.prefix}ai write a JavaScript debounce function\`\n` +
        `👉 Or reply to any message with \`${config.prefix}ai summarize this\``
      );
    }

    await reply('🧠 *Kuzmix AI is thinking...*');

    const apiKey = config.openRouterApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return reply(
        `⚠️ *OpenRouter API key not configured.*\n\n` +
        `The bot owner needs to set \`OPENROUTER_API_KEY\` in the environment variables.`
      );
    }

    try {
      const { postJson } = require('../lib/httpClient');

      const systemPrompt =
        `You are Kuzmix AI, the intelligent engine of Kuzmix-MD developed by ${config.developerName} (${config.organization}). ` +
        `Provide concise, highly accurate, and helpful responses formatted cleanly for WhatsApp with bold headers and bullet points where helpful. ` +
        `Use WhatsApp formatting: *bold*, _italic_, ~strikethrough~. Keep responses focused and useful.`;

      const response = await postJson(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openrouter/free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2048,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const text = response?.choices?.[0]?.message?.content?.trim();

      if (text) {
        const finalMsg =
          `╔═════『 *KUZMIX AI* 』═════\n` +
          `${text}\n` +
          `╚═══════════════════════════\n\n` +
          `_${config.watermark}_`;
        return reply(finalMsg);
      } else {
        throw new Error('No response from AI model');
      }
    } catch (err) {
      console.error('[AI CMD] OpenRouter error:', err.message);
      return reply(
        `⚠️ *AI Error:* ${err.message}\n\n` +
        `_Please try again or ask a different question._`
      );
    }
  },
};
