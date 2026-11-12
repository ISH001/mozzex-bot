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
    .setName('scan')
    .setDescription('Scan a memecoin CA (Solana/EVM) for real-time price, MC, liquidity & safety')
    .addStringOption(opt =>
      opt.setName('address')
        .setDescription('Contract address (CA) or pair address')
        .setRequired(true)
    ),

  async execute(interaction) {
    const address = interaction.options.getString('address').trim();
    await interaction.deferReply();

    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (!res.ok) {
        return interaction.editReply(`❌ DexScreener API responded with status ${res.status}.`);
      }

      const data = await res.json();
      const pairs = data.pairs || [];

      if (pairs.length === 0) {
        return interaction.editReply(`❌ No active liquidity pairs found for address: \`${address}\``);
      }

      // Pick the primary pair (highest liquidity)
      pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
      const pair = pairs[0];

      const name = pair.baseToken.name || 'Unknown';
      const symbol = pair.baseToken.symbol || '???';
      const chain = (pair.chainId || 'solana').toUpperCase();
      const priceUsd = pair.priceUsd ? `$${parseFloat(pair.priceUsd) < 0.0001 ? parseFloat(pair.priceUsd).toExponential(4) : parseFloat(pair.priceUsd).toFixed(6)}` : 'N/A';
      const fdv = pair.fdv ? `$${Math.round(pair.fdv).toLocaleString()}` : (pair.marketCap ? `$${Math.round(pair.marketCap).toLocaleString()}` : 'N/A');
      const liq = pair.liquidity?.usd ? `$${Math.round(pair.liquidity.usd).toLocaleString()}` : 'N/A';
      const vol5m = pair.volume?.m5 ? `$${Math.round(pair.volume.m5).toLocaleString()}` : '$0';
      const vol1h = pair.volume?.h1 ? `$${Math.round(pair.volume.h1).toLocaleString()}` : '$0';
      const vol24h = pair.volume?.h24 ? `$${Math.round(pair.volume.h24).toLocaleString()}` : '$0';

      const change5m = pair.priceChange?.m5 ?? 0;
      const change1h = pair.priceChange?.h1 ?? 0;
      const change24h = pair.priceChange?.h24 ?? 0;

      const formatPct = (val) => `${val >= 0 ? '🟢 +' : '🔴 '}${val.toFixed(2)}%`;

      const buys5m = pair.txns?.m5?.buys || 0;
      const sells5m = pair.txns?.m5?.sells || 0;
      const buyRatio = (buys5m + sells5m) > 0 ? Math.round((buys5m / (buys5m + sells5m)) * 100) : 50;

      const embed = new EmbedBuilder()
        .setColor(change5m >= 0 ? config.colors.primary : config.colors.danger)
        .setTitle(`⚡ ${name} ($${symbol}) — ${chain}`)
        .setURL(pair.url || `https://dexscreener.com/${pair.chainId}/${address}`)
        .setDescription(`**Contract Address:**\n\`${address}\``)
        .addFields(
          { name: '💰 Price', value: `\`${priceUsd}\``, inline: true },
          { name: '💎 Market Cap / FDV', value: `\`${fdv}\``, inline: true },
          { name: '💧 Liquidity', value: `\`${liq}\``, inline: true },
          { name: '⏱️ 5m Change', value: `\`${formatPct(change5m)}\``, inline: true },
          { name: '📈 1h Change', value: `\`${formatPct(change1h)}\``, inline: true },
          { name: '📊 24h Change', value: `\`${formatPct(change24h)}\``, inline: true },
          { name: '🔥 5m Volume', value: `\`${vol5m}\``, inline: true },
          { name: '🌊 1h Volume', value: `\`${vol1h}\``, inline: true },
          { name: '🎯 5m Buy Ratio', value: `\`${buyRatio}% Buys (${buys5m}B/${sells5m}S)\``, inline: true }
        )
        .setFooter({ text: 'Mozzex Scanner • Fast Memecoin Analytics' })
        .setTimestamp();

      if (pair.info?.imageUrl) {
        embed.setThumbnail(pair.info.imageUrl);
      }

      // Fast Trading Links Row
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('DexScreener')
          .setStyle(ButtonStyle.Link)
          .setURL(pair.url || `https://dexscreener.com/${pair.chainId}/${address}`),
        new ButtonBuilder()
          .setLabel('Photon')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://photon-sol.tinyastro.io/en/r/@mozzex/${address}`),
        new ButtonBuilder()
          .setLabel('BullX')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://bullx.io/terminal?chainId=1399811149&address=${address}`),
        new ButtonBuilder()
          .setLabel('RugCheck')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://rugcheck.xyz/tokens/${address}`)
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('Scan error:', err);
      await interaction.editReply(`❌ Error scanning token: ${err.message}`);
    }
  }
};
