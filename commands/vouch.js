const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Submit a verified vouch and review for a trader or service')
    .addUserOption(opt =>
      opt.setName('trader')
        .setDescription('Trader or mentor you are reviewing')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('rating')
        .setDescription('Rating from 1 to 5 stars')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)
    )
    .addStringOption(opt =>
      opt.setName('comment')
        .setDescription('Detailed review / experience')
        .setRequired(true)
    )
    .addAttachmentOption(opt =>
      opt.setName('proof')
        .setDescription('Screenshot proof of trade / profit / mentorship')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('trader');
    const rating = interaction.options.getInteger('rating');
    const comment = interaction.options.getString('comment');
    const proof = interaction.options.getAttachment('proof');

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot vouch for yourself!',
        ephemeral: true
      });
    }

    const proofUrl = proof ? proof.url : null;
    const vouch = db.addVouch(targetUser.id, interaction.user.id, rating, comment, proofUrl);

    const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`⭐ NEW VERIFIED VOUCH (ID: #${vouch.id})`)
      .setDescription(
        `**Trader Reviewed:** <@${targetUser.id}>\n` +
        `**Voucher:** <@${interaction.user.id}>\n` +
        `**Rating:** \`${stars}\` (${rating}/5)\n\n` +
        `**Review:**\n"${comment}"`
      )
      .setFooter({ text: 'Mozzex Reputation System' })
      .setTimestamp();

    if (proofUrl) {
      embed.setImage(proofUrl);
    }

    // Try to post in #vouches channel if found
    const vouchChannel = interaction.guild.channels.cache.find(
      c => c.name.toLowerCase().includes('vouch')
    );

    if (vouchChannel && vouchChannel.id !== interaction.channel.id) {
      try {
        await vouchChannel.send({ embeds: [embed] });
      } catch (err) {
        console.error('Failed to forward vouch to #vouches channel:', err);
      }
    }

    await interaction.reply({
      content: `✅ Successfully recorded vouch for <@${targetUser.id}>!`,
      embeds: [embed]
    });
  }
};
