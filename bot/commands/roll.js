/**
 * Kuzmix-MD Dice Roller Command (.roll / .dice)
 * Rolls a standard 6-sided dice or custom N-sided dice
 */

module.exports = {
  name: 'roll',
  aliases: ['dice'],
  category: 'Fun & Games',
  description: 'Rolls a random dice (1-6 or custom sides)',
  usage: '.roll [sides]',
  example: '.roll 20',
  permission: 'everyone',

  async execute(ctx) {
    const { reply, args, config } = ctx;

    let sides = 6;
    if (args[0] && !isNaN(parseInt(args[0]))) {
      sides = Math.max(2, Math.min(1000, parseInt(args[0])));
    }

    const roll = Math.floor(Math.random() * sides) + 1;
    const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const icon = sides === 6 ? diceIcons[roll - 1] : '🎲';

    const msg =
      `╔═════『 *DICE ROLL* 』═════\n` +
      `║ 🎲 *Sides:* D${sides}\n` +
      `║\n` +
      `║ 🎯 *You rolled:* ${icon} *${roll}*\n` +
      `╚═══════════════════════════\n\n` +
      `_${config.watermark}_`;

    await reply(msg);
  },
};
