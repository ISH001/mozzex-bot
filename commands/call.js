const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('call')
    .setDescription('Post an official Mozzex Alpha Callout')
    .addStringOption(opt =>
      opt.setName('address')
        .setDescription('Token contract address (CA)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('entry_mc')
        .setDescription('Market Cap at entry (e.g. 85K, 250K, 1.2M)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('target')
        .setDescription('Target Market Cap (e.g. 500K, 2M, 5M)')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('stop_loss')
        .setDescription('Stop Loss MC or % (e.g. -25% or 60K)')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('notes')
        .setDescription('Thesis / Catalyst / Dev info')
        .setRequired(false)
    ),

  async execute(interaction) {
    const address = interaction.options.getString('address').trim();
    const entryMc = interaction.options.getString('entry_mc');
    const target = interaction.options.getString('target') || '2x - 5x Moonbag';
    const stopLoss = interaction.options.getString('stop_loss') || '-30% or Breakeven';
    const notes = interaction.options.getString('notes') || 'Strong volume surge, dev holding, clean chart structure.';

    await interaction.deferReply();

    // Fetch live metadata if available
    let name = 'Memecoin Call';
    let symbol = 'ALPHA';
    let dexUrl = `https://dexscreener.com/solana/${address}`;

    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (res.ok) {
        const data = await res.json();
        if (data.pairs && data.pairs.length > 0) {
          name = data.pairs[0].baseToken.name;
          symbol = data.pairs[0].baseToken.symbol;
          dexUrl = data.pairs[0].url;
        }
      }
    } catch (e) {
      // fallback
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`🚨 MOZZEX ALPHA CALL: ${name} ($${symbol})`)
      .setURL(dexUrl)
      .setDescription(
        `**Caller:** <@${interaction.user.id}>\n\n` +
        `**Contract Address (CA):**\n\`${address}\` *(Click to copy)*\n\n` +
        `**Catalyst & Thesis:**\n${notes}`
      )
      .addFields(
        { name: '🎯 Entry MC', value: `\`${entryMc}\``, inline: true },
        { name: '🚀 Target MC', value: `\`${target}\``, inline: true },
        { name: '🛡️ Stop Loss', value: `\`${stopLoss}\``, inline: true }
      )
      .setFooter({ text: 'Mozzex Alpha • Manage risk & take profits systematically' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Chart (DexScreener)')
        .setStyle(ButtonStyle.Link)
        .setURL(dexUrl),
      new ButtonBuilder()
        .setLabel('Fast Buy (Photon)')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://photon-sol.tinyastro.io/en/r/@mozzex/${address}`),
      new ButtonBuilder()
        .setLabel('RugCheck')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://rugcheck.xyz/tokens/${address}`)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
