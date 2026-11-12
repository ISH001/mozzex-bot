const { ActivityType } = require('discord.js');
const { initInviteCache } = require('../utils/inviteTracker');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`===============================================`);
    console.log(`🚀 Mozzex Bot Online as: ${client.user.tag}`);
    console.log(`🌐 Serving in ${client.guilds.cache.size} server(s)`);
    console.log(`===============================================`);

    // Set Bot Rich Presence
    client.user.setPresence({
      activities: [
        {
          name: 'MOZZEX Memecoins & Alpha | /scan',
          type: ActivityType.Watching
        }
      ],
      status: 'online'
    });

    // Initialize invite tracker cache
    await initInviteCache(client);
  }
};
