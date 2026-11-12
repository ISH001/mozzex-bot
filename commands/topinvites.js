const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topinvites')
    .setDescription('View the Mozzex top community inviters leaderboard'),

  async execute(interaction) {
    const top = db.getTopInviters(10);

    if (top.length === 0) {
      return interaction.reply({
        content: 'ℹ️ No invites have been tracked yet! Share your invite links to get on the leaderboard.',
        ephemeral: true
      });
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const lines = top.map((entry, idx) => {
      const medal = medals[idx] || '🔹';
      return `${medal} <@${entry.userId}> — **${entry.net}** invites \`(${entry.regular} joins, ${entry.left} leaves)\``;
    });

    const embed = new EmbedBuilder()
      .setColor(config.colors.gold)
      .setTitle('🏆 MOZZEX TOP INVITERS LEADERBOARD')
      .setDescription(
        `Top community members growing the **Mozzex Trading Network**:\n\n` +
        lines.join('\n')
      )
      .setFooter({ text: 'Invites are updated in real-time on member join/leave.' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
