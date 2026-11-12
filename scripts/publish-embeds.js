const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const config = require('../config');
const {
  getRulesEmbed,
  getAnnouncementsEmbed,
  getMentorshipEmbed,
  getSupportDeskEmbed,
  getImportantInfoEmbed,
  getVouchesEmbed,
  getClientSupportEmbed
} = require('../utils/embedTemplates');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`[Publisher] Connected as ${client.user.tag}`);

  for (const [, guild] of client.guilds.cache) {
    console.log(`\n========================================`);
    console.log(`Publishing embeds for Server: "${guild.name}" (ID: ${guild.id})`);
    console.log(`========================================`);

    const channelMappings = [
      { key: 'rules', getter: getRulesEmbed, nameMatch: 'rules' },
      { key: 'announcements', getter: getAnnouncementsEmbed, nameMatch: 'announcement' },
      { key: 'mentorship', getter: getMentorshipEmbed, nameMatch: 'mentor' },
      { key: 'support', getter: getSupportDeskEmbed, nameMatch: 'support-desk' },
      { key: 'importantInfo', getter: getImportantInfoEmbed, nameMatch: 'important' },
      { key: 'vouches', getter: getVouchesEmbed, nameMatch: 'vouch' },
      { key: 'clientSupport', getter: getClientSupportEmbed, nameMatch: 'client-support' }
    ];

    for (const item of channelMappings) {
      const channel = guild.channels.cache.find(c =>
        c.type === ChannelType.GuildText && c.name.toLowerCase().includes(item.nameMatch)
      );

      if (channel) {
        try {
          const payload = item.getter();
          await channel.send(payload);
          console.log(`✅ [Success] Posted embed to #${channel.name}`);
        } catch (err) {
          console.error(`❌ [Failed] Could not post to #${channel.name}:`, err.message);
        }
      } else {
        console.warn(`⚠️ [Warning] Channel matching "${item.nameMatch}" not found in ${guild.name}`);
      }
    }
  }

  console.log(`\n🎉 All embeds processed successfully! Exiting...`);
  process.exit(0);
});

client.login(config.token).catch(err => {
  console.error('[Publisher] Login failed:', err);
  process.exit(1);
});
