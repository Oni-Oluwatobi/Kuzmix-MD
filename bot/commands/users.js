/**
 * Kuzmix-MD Command: .users
 * Category: admin
 * Description: Show bot user statistics
 */

module.exports = {
  name: 'users',
  aliases: ['userstats', 'usercount'],
  category: 'admin',
  description: 'Show bot user statistics',
  usage: '.users',
  example: '.users',
  permission: 'owner',

  async execute(ctx) {
    const { reply, config, database } = ctx;

    const users = database.get('users', {});
    const userKeys = Object.keys(users);
    const totalUsers = userKeys.length;

    if (totalUsers === 0) {
      return reply(
        `👥 *User Statistics*\n\n` +
        `No users tracked yet.\n\n` +
        `_${config.watermark}_`
      );
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;

    let active1h = 0;
    let active24h = 0;
    let active7d = 0;
    let totalMessages = 0;
    let ownerCount = 0;
    let groupUsers = new Set();

    for (const key of userKeys) {
      const u = users[key];
      const lastSeen = u.lastSeen || 0;
      const msgs = u.messages || 0;

      totalMessages += msgs;
      if (u.isOwner) ownerCount++;
      if (u.groups && u.groups.length > 0) {
        u.groups.forEach(g => groupUsers.add(g));
      }
      if (now - lastSeen < oneHour) active1h++;
      if (now - lastSeen < oneDay) active24h++;
      if (now - lastSeen < oneWeek) active7d++;
    }

    const topUsers = userKeys
      .map(k => ({ number: k, ...users[k] }))
      .sort((a, b) => (b.messages || 0) - (a.messages || 0))
      .slice(0, 5);

    const topList = topUsers.map((u, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      return `${medal} +${u.number} — ${u.messages || 0} msgs`;
    }).join('\n');

    const msg = [
      `╔═════『 *USER STATISTICS* 』═════`,
      ``,
      `👥 *Total Users:* ${totalUsers}`,
      `💬 *Total Messages:* ${totalMessages}`,
      `👑 *Owners:* ${ownerCount}`,
      `🏢 *Groups Active:* ${groupUsers.size}`,
      ``,
      `📊 *Activity:*`,
      `• Last hour: ${active1h}`,
      `• Last 24h: ${active24h}`,
      `• Last 7 days: ${active7d}`,
      ``,
      `🏆 *Top Users:*`,
      topList,
      ``,
      `╚═════════════════════════════════════`,
      ``,
      `_${config.watermark}_`,
    ].join('\n');

    return reply(msg);
  }
};
