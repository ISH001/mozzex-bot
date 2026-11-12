const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');
const config = require('../config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`[Permission Auditor] Connected as ${client.user.tag}`);

  for (const [, guild] of client.guilds.cache) {
    console.log(`\n========================================`);
    console.log(`Auditing & Fixing Permissions for Server: "${guild.name}"`);
    console.log(`========================================`);

    const everyone = guild.roles.everyone;

    // Fetch or find Staff & Premium roles
    let staffRole = guild.roles.cache.find(
      r => r.name.toLowerCase() === config.roles.staff.toLowerCase() ||
           r.name.toLowerCase().includes('staff') ||
           r.name.toLowerCase().includes('mod')
    );

    let premiumRole = guild.roles.cache.find(
      r => r.name.toLowerCase() === config.roles.premium.toLowerCase() ||
           r.name.toLowerCase().includes('premium') ||
           r.name.toLowerCase().includes('client') ||
           r.name.toLowerCase().includes('vip')
    );

    console.log(`Staff Role: ${staffRole ? staffRole.name : '(None found - will create or skip)'}`);
    console.log(`Premium Role: ${premiumRole ? premiumRole.name : '(None found - will create or skip)'}`);

    // If staff role doesn't exist, create it
    if (!staffRole) {
      try {
        staffRole = await guild.roles.create({
          name: 'Staff',
          color: 0x00FFA3,
          permissions: [
            PermissionFlagsBits.ViewAuditLog,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.KickMembers,
            PermissionFlagsBits.BanMembers,
            PermissionFlagsBits.MuteMembers
          ],
          reason: 'Mozzex Auto Setup'
        });
        console.log(`✨ Created role: Staff`);
      } catch (e) {
        console.warn('Could not auto-create Staff role:', e.message);
      }
    }

    // If premium role doesn't exist, create it
    if (!premiumRole) {
      try {
        premiumRole = await guild.roles.create({
          name: 'Premium Member',
          color: 0xFFD700,
          reason: 'Mozzex Auto Setup'
        });
        console.log(`✨ Created role: Premium Member`);
      } catch (e) {
        console.warn('Could not auto-create Premium role:', e.message);
      }
    }

    // Iterate through all channels & categories
    const channels = await guild.channels.fetch();

    for (const [, channel] of channels) {
      if (!channel) continue;
      const name = channel.name.toLowerCase();

      // 1. STAFF HQ (Category & Channels) - Strictly Staff Only
      if (name.includes('staff') || name.includes('mod-log') || name.includes('member-report') || name.includes('sales-tracking')) {
        try {
          const overwrites = [
            { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
          ];
          if (staffRole) {
            overwrites.push({
              id: staffRole.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
              ]
            });
          }
          await channel.permissionOverwrites.set(overwrites);
          console.log(`🔒 [Staff Only] Locked #${channel.name}`);
        } catch (err) {
          console.error(`Error locking #${channel.name}:`, err.message);
        }
        continue;
      }

      // 2. MEMBERS / VIP (Category & Channels) - Strictly Premium Only
      if (name.includes('members') || name.includes('premium') || name.includes('insider-broadcast') || name.includes('ask-your-mentor')) {
        try {
          const overwrites = [
            { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
          ];
          if (premiumRole) {
            overwrites.push({
              id: premiumRole.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
              ]
            });
          }
          if (staffRole) {
            overwrites.push({
              id: staffRole.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            });
          }
          await channel.permissionOverwrites.set(overwrites);
          console.log(`💎 [VIP Only] Locked #${channel.name}`);
        } catch (err) {
          console.error(`Error locking #${channel.name}:`, err.message);
        }
        continue;
      }

      // 3. INFORMATION & CLIENT CAPITAL INFO (Read-Only to Public)
      if (
        name.includes('rules') ||
        name.includes('announcement') ||
        name.includes('mentor') ||
        name.includes('important-info') ||
        name.includes('vouches')
      ) {
        try {
          await channel.permissionOverwrites.edit(everyone, {
            ViewChannel: true,
            SendMessages: false,
            AddReactions: true,
            ReadMessageHistory: true
          });
          console.log(`🛡️ [Read Only] Enforced on #${channel.name}`);
        } catch (err) {
          console.error(`Error configuring #${channel.name}:`, err.message);
        }
        continue;
      }

      // 4. COMMUNITY (Public Chatting, Media, Links)
      if (
        name.includes('general') ||
        name.includes('intro') ||
        name.includes('trading-setup') ||
        name.includes('profit') ||
        name.includes('feedback')
      ) {
        try {
          await channel.permissionOverwrites.edit(everyone, {
            ViewChannel: true,
            SendMessages: true,
            AttachFiles: true,
            EmbedLinks: true,
            ReadMessageHistory: true,
            AddReactions: true,
            MentionEveryone: false // Prevent @everyone raids
          });
          console.log(`💬 [Community Open] Configured #${channel.name}`);
        } catch (err) {
          console.error(`Error configuring #${channel.name}:`, err.message);
        }
        continue;
      }
    }
  }

  console.log(`\n🎉 Permission setup complete! Exiting...`);
  process.exit(0);
});

client.login(config.token).catch(err => {
  console.error('[Permission Auditor] Login failed:', err);
  process.exit(1);
});
