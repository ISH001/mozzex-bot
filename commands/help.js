const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('View the Mozzex bot commands and usage guide'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('⚡ MOZZEX BOT — COMMAND DIRECTORY')
      .setDescription(
        `Welcome to the **Mozzex Trading & Community Bot**.\n` +
        `Below are the primary commands for memecoin analysis, invites, reputation, and support:`
      )
      .addFields(
        {
          name: '🔍 Memecoin & Trading',
          value:
            '• `/scan <ca>` — Scan any token contract for price, liquidity, MC, volume & buy ratio.\n' +
            '• `/call <ca> <entry_mc>` — Post an official alpha call to signal channels.\n' +
            '• `/pnl <token> <profit_sol> <roi_pct>` — Generate a PnL execution flex card.',
          inline: false
        },
        {
          name: '📊 Invites & Community',
          value:
            '• `/invites [user]` — View detailed invite statistics (net, joins, leaves, fakes).\n' +
            '• `/topinvites` — View the top community inviter leaderboard.',
          inline: false
        },
        {
          name: '⭐ Reputation & Vouches',
          value:
            '• `/vouch <trader> <rating> <comment>` — Record an official trader/client review.',
          inline: false
        },
        {
          name: '⚙️ Server Administration (Staff)',
          value:
            '• `/setup embeds` — Automatically dispatch all official embeds to public channels.\n' +
            '• `/setup permissions` — Lock categories & enforce read-only and VIP permissions.',
          inline: false
        }
      )
      .setFooter({ text: 'Mozzex Network • Trading Alpha & Community Infrastructure' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
