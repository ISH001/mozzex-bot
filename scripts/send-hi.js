const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
  console.log(`[Bot Ready] Logged in as ${client.user.tag}`);

  let sent = false;

  for (const [, guild] of client.guilds.cache) {
    console.log(`Checking guild: ${guild.name} (${guild.id})`);

    const channels = await guild.channels.fetch();
    const generalChannel = channels.find(c =>
      c && c.isTextBased() && c.name.toLowerCase().includes('general')
    );

    if (generalChannel) {
      try {
        await generalChannel.send('👋 **Hi everyone! Mozzex Bot is officially online and ready.** 🚀');
        console.log(`✅ Successfully sent message to #${generalChannel.name} in "${guild.name}"!`);
        sent = true;
      } catch (err) {
        console.error(`❌ Could not send to #${generalChannel.name} in "${guild.name}":`, err.message);
      }
    } else {
      console.log(`⚠️ No #general channel found in "${guild.name}".`);
    }
  }

  if (!sent) {
    console.log('No general channels were found across connected servers.');
  }

  process.exit(0);
});

client.login(config.token).catch(err => {
  console.error('Login failed:', err);
  process.exit(1);
});
