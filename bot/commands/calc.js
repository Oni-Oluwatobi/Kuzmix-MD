/**
 * Kuzmix-MD Mathematical Calculator (.calc / .math)
 * Safely evaluates mathematical expressions
 */

module.exports = {
  name: 'calc',
  aliases: ['math', 'calculate', 'solve'],
  category: 'Utilities',
  description: 'Safely evaluates mathematical expressions and equations',
  usage: '.calc [expression]',
  example: '.calc (45 * 12) + 250 / 5',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    let expr = args.join(' ').trim();
    if (!expr) {
      return reply(
        `🧮 *Kuzmix Smart Calculator*\n\n` +
        `Enter any mathematical expression:\n` +
        `👉 \`${config.prefix}calc 25 * 4 + 120\`\n` +
        `👉 \`${config.prefix}calc (150 - 30) / 4\`\n` +
        `👉 \`${config.prefix}calc sqrt(144) + 10\`\n` +
        `👉 \`${config.prefix}calc 2^8\``
      );
    }

    try {
      // Clean and sanitize expression: allow only numbers, basic operators, parenthesis, and math functions
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
        .replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
        .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
        .replace(/tan\(([^)]+)\)/g, 'Math.tan($1)')
        .replace(/abs\(([^)]+)\)/g, 'Math.abs($1)')
        .replace(/pi/gi, 'Math.PI');

      // Security check: only allow safe characters
      if (/[^0-9+\-*/().,MathPIsqrtsincostanabs\s]/.test(sanitized)) {
        throw new Error('Expression contains invalid or unsupported characters.');
      }

      // Safe Function constructor invocation (isolated scope)
      const calculate = new Function(`return (${sanitized});`);
      const result = calculate();

      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error('Could not calculate a valid number.');
      }

      const formattedResult = Number.isInteger(result)
        ? result.toLocaleString('en-US')
        : result.toLocaleString('en-US', { maximumFractionDigits: 6 });

      const msg =
        `╔═════『 *KUZMIX CALCULATOR* 』═════\n` +
        `║ 📝 *Expression:* ${expr}\n` +
        `║ 🎯 *Result:* *${formattedResult}*\n` +
        `╚═══════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await reply(msg);
    } catch (err) {
      console.error('[CALC CMD ERROR]', err.message);
      await reply(`❌ *Invalid Calculation:* ${err.message}`);
    }
  },
};
