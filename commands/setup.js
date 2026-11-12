const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');
const {
  getRulesEmbed,
  getAnnouncementsEmbed,
  getMentorshipEmbed,
  getSupportDeskEmbed,
  getImportantInfoEmbed,
  getVouchesEmbed,
  getClientSupportEmbed
} = require('../utils/embedTemplates');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Server setup and embed deployment utility (Admin Only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('embeds')
        .setDescription('Deploy official Mozzex embeds to all public channels')
    )
    .addSubcommand(sub =>
      sub.setName('permissions')
        .setDescription('Audit and lock down roles & permissions according to Mozzex standards')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You must be an Administrator to run this command.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;

    if (subcommand === 'embeds') {
      const channelMappings = [
        { key: 'rules', getter: getRulesEmbed, nameMatch: 'rules' },
        { key: 'announcements', getter: getAnnouncementsEmbed, nameMatch: 'announcement' },
        { key: 'mentorship', getter: getMentorshipEmbed, nameMatch: 'mentor' },
        { key: 'support', getter: getSupportDeskEmbed, nameMatch: 'support-desk' },
        { key: 'importantInfo', getter: getImportantInfoEmbed, nameMatch: 'important' },
        { key: 'vouches', getter: getVouchesEmbed, nameMatch: 'vouch' },
        { key: 'clientSupport', getter: getClientSupportEmbed, nameMatch: 'client-support' }
      ];

      const report = [];

      for (const item of channelMappings) {
        const targetChannel = guild.channels.cache.find(c =>
          c.type === ChannelType.GuildText && c.name.toLowerCase().includes(item.nameMatch)
        );

        if (targetChannel) {
          try {
            const payload = item.getter();
            await targetChannel.send(payload);
            report.push(`✅ Sent embed to <#${targetChannel.id}> (\`#${targetChannel.name}\`)`);
          } catch (err) {
            report.push(`❌ Failed in \`#${targetChannel.name}\`: ${err.message}`);
          }
        } else {
          report.push(`⚠️ Channel matching \`${item.nameMatch}\` not found in server.`);
        }
      }

      return interaction.editReply({
        content: `**🚀 Mozzex Embed Deployment Complete:**\n\n${report.join('\n')}`
      });
    }

    if (subcommand === 'permissions') {
      const report = [];
      const everyone = guild.roles.everyone;

      // 1. Lock down categories
      for (const [, channel] of guild.channels.cache) {
        const name = channel.name.toLowerCase();

        // Lock STAFF HQ completely from @everyone
        if (name.includes('staff') || name.includes('mod-logs')) {
          try {
            await channel.permissionOverwrites.edit(everyone, {
              ViewChannel: false
            });
            report.push(`🔒 Locked \`#${channel.name}\` from @everyone`);
          } catch (e) {
            // pass
          }
        }

        // Lock MEMBERS (Premium) completely from @everyone
        if (name.includes('members') || name.includes('premium') || name.includes('insider-broadcast')) {
          try {
            await channel.permissionOverwrites.edit(everyone, {
              ViewChannel: false
            });
            report.push(`🔒 Locked VIP/Premium \`#${channel.name}\` from @everyone`);
          } catch (e) {
            // pass
          }
        }

        // Read-only public channels (rules, announcements, mentorship, important-info)
        if (name.includes('rules') || name.includes('announcement') || name.includes('mentor') || name.includes('important')) {
          try {
            await channel.permissionOverwrites.edit(everyone, {
              ViewChannel: true,
              SendMessages: false,
              AddReactions: true,
              ReadMessageHistory: true
            });
            report.push(`🛡️ Set Read-Only on \`#${channel.name}\``);
          } catch (e) {
            // pass
          }
        }

        // Open community channels for chatting
        if (name.includes('general') || name.includes('intro') || name.includes('trading-setup') || name.includes('profit')) {
          try {
            await channel.permissionOverwrites.edit(everyone, {
              ViewChannel: true,
              SendMessages: true,
              AttachFiles: true,
              EmbedLinks: true,
              ReadMessageHistory: true
            });
            report.push(`💬 Verified chatting permissions on \`#${channel.name}\``);
          } catch (e) {
            // pass
          }
        }
      }

      return interaction.editReply({
        content: `**🛡️ Role & Permission Audit Complete:**\n\n${report.slice(0, 20).join('\n')}\n*(${report.length} total channel rules updated)*`
      });
    }
  }
};
