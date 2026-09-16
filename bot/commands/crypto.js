/**
 * Kuzmix-MD Cryptocurrency Tracker (.crypto / .coin / .btc)
 * Live prices and 24h market trends via CoinGecko API
 */

module.exports = {
  name: 'crypto',
  aliases: ['coin', 'btc', 'eth', 'sol'],
  category: 'Utilities',
  description: 'Fetches live cryptocurrency prices and market stats in USD',
  usage: '.crypto [coin ticker or name]',
  example: '.crypto btc',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const query = args[0]?.toLowerCase() || 'top';

    const coinMap = {
      btc: 'bitcoin',
      bitcoin: 'bitcoin',
      eth: 'ethereum',
      ethereum: 'ethereum',
      sol: 'solana',
      solana: 'solana',
      bnb: 'binancecoin',
      binancecoin: 'binancecoin',
      xrp: 'ripple',
      ripple: 'ripple',
      doge: 'dogecoin',
      dogecoin: 'dogecoin',
      ada: 'cardano',
      cardano: 'cardano',
      ton: 'the-open-network',
      trx: 'tron',
    };

    const targetId = coinMap[query] || query;

    try {
      const { getJson } = require('../lib/httpClient');
      let url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true`;

      if (targetId !== 'top') {
        url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(targetId)}&vs_currencies=usd&include_24hr_change=true`;
      }

      const data = await getJson(url, { timeout: 10000 });

      if (!data || Object.keys(data).length === 0) {
        throw new Error('Coin not found');
      }

      let text = `╔═════『 *CRYPTO MARKET WATCH* 』═════\n`;

      for (const [id, details] of Object.entries(data)) {
        const price = Number(details.usd).toLocaleString('en-US', {
          minimumFractionDigits: details.usd < 1 ? 4 : 2,
          maximumFractionDigits: details.usd < 1 ? 6 : 2,
        });
        const change = details.usd_24h_change ? details.usd_24h_change.toFixed(2) : '0.00';
        const trendIcon = Number(change) >= 0 ? '🟢 +' : '🔴 ';
        const nameUpper = id.replace(/-/g, ' ').toUpperCase();

        text += `║ 🪙 *${nameUpper}:* $${price} (${trendIcon}${change}%)\n`;
      }

      text += `╚═════════════════════════════════════\n\n`;
      text += `_Type \`${config.prefix}crypto btc\` or \`${config.prefix}crypto sol\` for specific coins._\n`;
      text += `_${config.watermark}_`;

      await reply(text);
    } catch (err) {
      console.error('[CRYPTO CMD ERROR]', err.message);
      await reply(
        `❌ *Could not fetch crypto data for "${query}"*\n` +
        `_Try supported tickers: btc, eth, sol, bnb, xrp, doge_\n` +
        `_Example: \`${config.prefix}crypto sol\`_`
      );
    }
  },
};
