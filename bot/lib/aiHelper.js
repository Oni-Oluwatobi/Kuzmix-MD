/**
 * Shared AI Helper for Kuzmix-MD
 * Uses OpenRouter API with top-tier models
 */

const config = require('../config');
const { postJson } = require('./httpClient');

const SYSTEM_PREFIX =
  `You are Kuzmix AI, the intelligent engine of Kuzmix-MD developed by ${config.developerName} (${config.organization}). ` +
  `Provide concise, highly accurate, and helpful responses formatted cleanly for WhatsApp with bold headers and bullet points where helpful. ` +
  `Use WhatsApp formatting: *bold*, _italic_, ~strikethrough~. Keep responses focused and useful.`;

/**
 * Send a prompt to OpenRouter and get a response.
 * @param {string} prompt - The user's question or task
 * @param {string} [systemOverride] - Optional custom system prompt (appended to base)
 * @param {object} [opts] - Options: { model, maxTokens, timeout }
 * @returns {Promise<string>} The AI response text
 */
async function ask(prompt, systemOverride, opts = {}) {
  const apiKey = config.openRouterApiKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured. Ask the bot owner to set it.');
  }

  const model = opts.model || 'anthropic/claude-sonnet-4';
  const maxTokens = opts.maxTokens || 2048;
  const timeout = opts.timeout || 60000;

  const systemPrompt = systemOverride
    ? `${SYSTEM_PREFIX}\n\nAdditional instructions: ${systemOverride}`
    : SYSTEM_PREFIX;

  const response = await postJson(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout,
    }
  );

  const text = response?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('No response from AI model');
  }
  return text;
}

/**
 * Format AI response for WhatsApp with standard wrapper.
 */
function format(text, title) {
  const header = title ? `╔═════『 *${title}* 』═════` : `╔═════『 *KUZMIX AI* 』═════`;
  return `${header}\n${text}\n╚═══════════════════════════\n\n_${config.watermark}_`;
}

module.exports = { ask, format };
