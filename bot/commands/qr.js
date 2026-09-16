/**
 * Kuzmix-MD QR Code Generator (.qr / .qrcode)
 * Creates high-resolution QR codes from text, phone numbers, or URLs
 */

module.exports = {
  name: 'qr',
  aliases: ['qrcode', 'makeqr'],
  category: 'Media & Download',
  description: 'Generates a scannable QR code image from any text or URL',
  usage: '.qr [text or URL]',
  example: '.qr https://kuzmix.com',
  permission: 'everyone',

  async execute(ctx) {
    const { sock, msg, from, reply, args, config } = ctx;

    const data = args.join(' ').trim();
    if (!data) {
      return reply(
        `📱 *Kuzmix QR Code Generator*\n\n` +
        `Please provide text or a link to encode into a QR code:\n` +
        `👉 \`${config.prefix}qr https://google.com\`\n` +
        `👉 \`${config.prefix}qr Kuzmix-MD WhatsApp Multi-Device\`\n` +
        `👉 \`${config.prefix}qr +2348143186133\``
      );
    }

    await reply('⚡ *Generating QR code...*');

    try {
      const { getBuffer } = require('../lib/httpClient');
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&format=png&data=${encodeURIComponent(data)}`;

      const buffer = await getBuffer(qrApiUrl, { timeout: 10000 });

      const caption =
        `╔═════『 *KUZMIX QR CODE* 』═════\n` +
        `║ 📄 *Encoded Data:* ${data.length > 50 ? data.slice(0, 47) + '...' : data}\n` +
        `║ 📐 *Dimensions:* 600x600 px\n` +
        `║ 🔍 *Format:* PNG\n` +
        `╚════════════════════════════════\n\n` +
        `_${config.watermark}_`;

      await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
    } catch (err) {
      console.error('[QR CMD ERROR]', err.message);
      await reply(`⚠️ *Failed to generate QR code:* ${err.message}`);
    }
  },
};
