const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pnl')
    .setDescription('Flex your trading profit and ROI card in #profits-and-milestones')
    .addStringOption(opt =>
      opt.setName('token')
        .setDescription('Token symbol or name (e.g. $MOZZ, $SOL, $DOGE)')
        .setRequired(true)
    )
    .addNumberOption(opt =>
      opt.setName('profit_sol')
        .setDescription('Profit amount in SOL (e.g. 12.5)')
        .setRequired(true)
    )
    .addNumberOption(opt =>
      opt.setName('roi_pct')
        .setDescription('Return on Investment percentage (e.g. 350 for +350%)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('holding_time')
        .setDescription('How long you held (e.g. 15 minutes, 2 hours, 1 day)')
        .setRequired(false)
    )
    .addAttachmentOption(opt =>
      opt.setName('screenshot')
        .setDescription('Optional screenshot proof from BullX / Photon / Phantom')
        .setRequired(false)
    ),

  async execute(interaction) {
    const token = interaction.options.getString('token').toUpperCase();
    const profitSol = interaction.options.getNumber('profit_sol');
    const roiPct = interaction.options.getNumber('roi_pct');
    const holdingTime = interaction.options.getString('holding_time') || 'Scalp Execution';
    const screenshot = interaction.options.getAttachment('screenshot');

    const multiplier = ((roiPct / 100) + 1).toFixed(1);
    const isWin = roiPct >= 0;

    const embed = new EmbedBuilder()
      .setColor(isWin ? config.colors.primary : config.colors.danger)
      .setTitle(`🏆 MOZZEX TRADE EXECUTION: ${token}`)
      .setDescription(
        `**Trader:** <@${interaction.user.id}>\n` +
        `**Status:** ${isWin ? '🟢 PROFIT SECURED' : '🔴 LOSS CUT'}`
      )
      .addFields(
        { name: '💰 Realized Profit', value: `\`+${profitSol} SOL\``, inline: true },
        { name: '📈 Total ROI', value: `\`+${roiPct}%\` (**${multiplier}x**)`, inline: true },
        { name: '⏱️ Duration', value: `\`${holdingTime}\``, inline: true }
      )
      .setFooter({ text: 'Mozzex Profits & Milestones • Consistency over luck' })
      .setTimestamp();

    if (screenshot) {
      embed.setImage(screenshot.url);
    }

    await interaction.reply({ embeds: [embed] });
  }
};
