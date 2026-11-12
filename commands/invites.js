const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Check your or another member’s invite statistics')
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('Member to check invites for (defaults to you)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('member') || interaction.user;
    const stats = db.getInvites(targetUser.id);

    const embed = new EmbedBuilder()
      .setColor(config.colors.accent)
      .setTitle(`📊 INVITE STATS: ${targetUser.username.toUpperCase()}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription(`<@${targetUser.id}> has brought **${stats.net}** active members into Mozzex!`)
      .addFields(
        { name: '✨ Net Invites', value: `\`${stats.net}\``, inline: true },
        { name: '📥 Total Joined', value: `\`${stats.regular}\``, inline: true },
        { name: '📤 Left Server', value: `\`${stats.left}\``, inline: true },
        { name: '⚠️ Fake/Suspicious', value: `\`${stats.fake}\``, inline: true },
        { name: '🎁 Bonus Invites', value: `\`${stats.bonus}\``, inline: true }
      )
      .setFooter({ text: 'Mozzex Invite Tracking System' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
