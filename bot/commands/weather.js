/**
 * Kuzmix-MD Live Weather Command (.weather / .temp)
 * Worldwide live weather forecasts with zero API key requirement
 */

module.exports = {
  name: 'weather',
  aliases: ['temp', 'forecast', 'climate'],
  category: 'Internet & Search',
  description: 'Fetches real-time weather and temperature for any city worldwide',
  usage: '.weather [city or country]',
  example: '.weather Lagos',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    const city = args.join(' ').trim();
    if (!city) {
      return reply(
        `🌦️ *Kuzmix Weather Service*\n\n` +
        `Please specify a city or location:\n` +
        `👉 \`${config.prefix}weather Lagos\`\n` +
        `👉 \`${config.prefix}weather London\`\n` +
        `👉 \`${config.prefix}weather Nairobi\`\n` +
        `👉 \`${config.prefix}weather New York\``
      );
    }

    await reply(`🔍 *Checking real-time weather for "${city}"...*`);

    try {
      const { getJson } = require('../lib/httpClient');
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const data = await getJson(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 10000,
      });
      const current = data.current_condition?.[0];
      const nearest = data.nearest_area?.[0];

      if (!current) {
        throw new Error('No weather data found for this location.');
      }

      const locationName = nearest?.areaName?.[0]?.value || city;
      const country = nearest?.country?.[0]?.value || '';
      const region = nearest?.region?.[0]?.value || '';

      const tempC = current.temp_C;
      const tempF = current.temp_F;
      const feelsC = current.FeelsLikeC;
      const feelsF = current.FeelsLikeF;
      const humidity = current.humidity;
      const windSpeed = current.windspeedKmph;
      const windDir = current.winddir16Point;
      const desc = current.weatherDesc?.[0]?.value || 'Clear';
      const uv = current.uvIndex || 'Moderate';
      const visibility = current.visibility || '10';

      // Weather icon mapping
      let icon = '☀️';
      const d = desc.toLowerCase();
      if (d.includes('rain') || d.includes('drizzle')) icon = '🌧️';
      else if (d.includes('cloud') || d.includes('overcast')) icon = '☁️';
      else if (d.includes('thunder') || d.includes('storm')) icon = '⛈️';
      else if (d.includes('snow')) icon = '❄️';
      else if (d.includes('fog') || d.includes('mist')) icon = '🌫️';
      else if (d.includes('sun') || d.includes('clear')) icon = '☀️';

      const weatherMsg =
        `╔═════『 *WEATHER: ${locationName.toUpperCase()}* 』═════\n` +
        `║ ${icon} *Condition:* ${desc}\n` +
        `║ 🌡️ *Temperature:* ${tempC}°C / ${tempF}°F\n` +
        `║ 🤔 *Feels Like:* ${feelsC}°C / ${feelsF}°F\n` +
        `║ 💧 *Humidity:* ${humidity}%\n` +
        `║ 💨 *Wind:* ${windSpeed} km/h (${windDir})\n` +
        `║ ☀️ *UV Index:* ${uv}\n` +
        `║ 👁️ *Visibility:* ${visibility} km\n` +
        `║ 📍 *Location:* ${locationName}${region ? ', ' + region : ''}${country ? ', ' + country : ''}\n` +
        `╚═══════════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await reply(weatherMsg);
    } catch (err) {
      console.error('[WEATHER CMD ERROR]', err.message);
      await reply(
        `❌ *Could not retrieve weather for "${city}"*\n` +
        `Please check the spelling or try another nearby major city.\n` +
        `_Example: \`${config.prefix}weather Lagos\`_`
      );
    }
  },
};
