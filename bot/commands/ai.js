/**
 * Kuzmix-MD AI Command (.ai / .ask / .gpt)
 * Uses Google Gemini AI or intelligent assistant reasoning
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
    const { reply, args, msg, config, sender } = ctx;

    // Support both direct text and replying to a message
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

    // 1. Try Google Gemini SDK if API key is provided
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt =
          `You are Kuzmix AI, the intelligent engine of Kuzmix-MD developed by ${config.developerName} (${config.organization}). ` +
          `Provide concise, highly accurate, and helpful responses formatted cleanly for WhatsApp with bold headers and bullet points where helpful.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser Question: ${prompt}`,
        });

        const text = response.text ? response.text.trim() : '';
        if (text) {
          const finalMsg =
            `╔═════『 *KUZMIX AI* 』═════\n` +
            `${text}\n` +
            `╚═══════════════════════════\n\n` +
            `_${config.watermark}_`;
          return reply(finalMsg);
        }
      } catch (geminiErr) {
        console.warn('[AI CMD] Gemini API error, falling back:', geminiErr.message);
      }
    }

    // 2. Free DuckDuckGo / Open AI Assistant fallback
    try {
      const { getJson } = require('../lib/httpClient');
      const encoded = encodeURIComponent(prompt);
      const ddgUrl = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;
      const resData = await getJson(ddgUrl, { timeout: 8000 });
      const abstract = resData?.AbstractText || resData?.RelatedTopics?.[0]?.Text;

      if (abstract) {
        const out =
          `╔═════『 *KUZMIX AI KNOWLEDGE* 』═════\n` +
          `${abstract}\n` +
          `╚══════════════════════════════════════\n\n` +
          `_${config.watermark}_`;
        return reply(out);
      }
    } catch (_) {}

    // 3. Informative response if no external provider returned
    return reply(
      `🤖 *Kuzmix AI Response*\n\n` +
      `Prompt: _"${prompt}"_\n\n` +
      `💡 *Tip:* To unlock full generative capabilities with Gemini 2.5 Flash, set \`GEMINI_API_KEY\` in your bot configuration or environment variables.`
    );
  },
};
