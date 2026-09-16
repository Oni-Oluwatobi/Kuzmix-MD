/**
 * Kuzmix-MD Currency Converter Command (.currency / .fx / .convert)
 * Real-time foreign exchange conversions via Open Exchange Rates API
 */

module.exports = {
  name: 'currency',
  aliases: ['fx', 'curr', 'convert'],
  category: 'Utilities',
  description: 'Converts between world currencies using real-time exchange rates',
  usage: '.currency [amount] [from] [to]',
  example: '.currency 100 USD NGN',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    // Expected format: .currency 100 USD EUR, or .currency USD NGN
    let amount = 1;
    let from = 'USD';
    let to = 'NGN';

    if (args.length === 3) {
      amount = parseFloat(args[0]) || 1;
      from = args[1].toUpperCase();
      to = args[2].toUpperCase();
    } else if (args.length === 2) {
      from = args[0].toUpperCase();
      to = args[1].toUpperCase();
    } else if (args.length === 1 && !isNaN(parseFloat(args[0]))) {
      amount = parseFloat(args[0]);
    } else if (args.length === 0) {
      return reply(
        `💱 *Kuzmix Currency Converter*\n\n` +
        `Usage:\n` +
        `👉 \`${config.prefix}currency 100 USD NGN\`\n` +
        `👉 \`${config.prefix}currency 50 EUR USD\`\n` +
        `👉 \`${config.prefix}currency 1000 GBP KES\``
      );
    }

    try {
      const { getJson } = require('../lib/httpClient');
      const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`;
      const data = await getJson(url, { timeout: 10000 });

      if (!data?.rates || !data.rates[to]) {
        throw new Error(`Currency rate not available for ${from} to ${to}`);
      }

      const rate = data.rates[to];
      const result = (amount * rate).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const formattedAmount = amount.toLocaleString('en-US');

      const msg =
        `╔═════『 *CURRENCY EXCHANGE* 』═════\n` +
        `║ 💵 *Amount:* ${formattedAmount} ${from}\n` +
        `║ 💱 *Rate:* 1 ${from} = ${rate.toLocaleString('en-US')} ${to}\n` +
        `║ 🎯 *Converted Total:* *${result} ${to}*\n` +
        `║ 🕒 *Updated:* ${new Date().toLocaleDateString()}\n` +
        `╚════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await reply(msg);
    } catch (err) {
      console.error('[CURRENCY CMD ERROR]', err.message);
      await reply(
        `❌ *Exchange conversion failed for ${from} ➔ ${to}*\n` +
        `_Ensure valid 3-letter currency codes (e.g. USD, EUR, GBP, NGN, KES, CAD, ZAR)._`
      );
    }
  },
};
