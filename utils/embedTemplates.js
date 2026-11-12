const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

function getRulesEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('⚡ MOZZEX TRADING COMMUNITY — OFFICIAL RULES & SAFETY')
    .setDescription(
      `Welcome to **MOZZEX**. Our community is dedicated to high-conviction memecoin trading, alpha discovery, and professional mentorship.\n\n` +
      `To protect your capital and maintain a professional trading environment, every member must strictly adhere to the guidelines below:`
    )
    .addFields(
      {
        name: '🛡️ Rule 1: Zero Tolerance For Drainers & Honeypots',
        value: 'Posting malicious smart contracts, drainer links, fake airdrop mints, or malicious bots will result in an immediate **permanent IP ban**, bot report, and network blacklisting.',
        inline: false
      },
      {
        name: '🚫 Rule 2: No Unsolicited Direct Messages (DMs)',
        value: 'Staff, Mentors, and Mozzex Bots will **NEVER** DM you first asking for seed phrases, private keys, or wallet connections. Anyone DMing you claiming to be Mozzex staff is an impersonator.',
        inline: false
      },
      {
        name: '📉 Rule 3: Memecoin Trading & Risk Disclosure',
        value: 'Memecoins and micro-caps carry high volatility. Never trade with capital you cannot afford to lose. All callouts, charts, and discussion in this server are for educational purposes and do **not** constitute financial advice (DYOR).',
        inline: false
      },
      {
        name: '🤝 Rule 4: Respect & Degen Etiquette',
        value: 'Keep conversations constructive. Healthy debate on token fundamentals and technical charts is encouraged. Toxicity, harassment, racist slurs, and intentional FUD raiding are strictly forbidden.',
        inline: false
      },
      {
        name: '📢 Rule 5: No Self-Promotion or Unapproved Links',
        value: 'Do not shill external Discord servers, paid telegram channels, or unverified affiliate links without explicit written permission from the Founders.',
        inline: false
      }
    )
    .setImage('https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80')
    .setFooter({ text: 'Mozzex Trading Network • Built for Degens, Mentored for Profit', iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png' })
    .setTimestamp();

  return { embeds: [embed] };
}

function getAnnouncementsEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.accent)
    .setTitle('🚀 WELCOME TO MOZZEX — THE NEXT-GEN ALPHA HUB')
    .setDescription(
      `**Mozzex** brings together disciplined traders, technical chartists, and memecoin degens. We combine institutional execution speed with community alpha to spot 10x–100x setups early.\n\n` +
      `Here is your quick roadmap to navigate the server:`
    )
    .addFields(
      {
        name: '📌 Step 1: Safety First',
        value: 'Review <#server-rules> to stay protected against drainers and impersonators.',
        inline: true
      },
      {
        name: '🤝 Step 2: Introduce Yourself',
        value: 'Head over to <#introductions> and let us know what chains you trade (Solana, Base, ETH).',
        inline: true
      },
      {
        name: '📈 Step 3: Trading Floor',
        value: 'Discuss live setups in <#general-chat> and share your charts in <#trading-setups>.',
        inline: true
      },
      {
        name: '🏆 Step 4: Share Your Wins',
        value: 'Flex your executed multipliers and PnL cards in <#profits-and-milestones>.',
        inline: true
      },
      {
        name: '💎 Step 5: Level Up Your Trading',
        value: 'Looking to trade with funded capital or 1-on-1 coaching? Check <#trading-mentorship>.',
        inline: true
      },
      {
        name: '🎫 Step 6: Support & Assistance',
        value: 'Have questions or need help? Open a private ticket in <#support-desk>.',
        inline: true
      }
    )
    .setFooter({ text: 'Mozzex Network • Trading & Alpha Ecosystem' })
    .setTimestamp();

  return { embeds: [embed] };
}

function getMentorshipEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.gold)
    .setTitle('💎 MOZZEX TRADING MENTORSHIP & CLIENT CAPITAL')
    .setDescription(
      `Stop gambling on random launches. The **Mozzex Mentorship Program** is engineered to transform retail degens into disciplined, consistent, and profitable on-chain operators.\n\n` +
      `Whether you are learning to read liquidity migration or scaling to 6-figure trade sizes, our structured curriculum gives you the exact edge.`
    )
    .addFields(
      {
        name: '🎯 1. On-Chain Sniping & Speed Optimization',
        value: '• Master BullX, Photon, Axiom, and private Jito RPC setups.\n• Sub-second entry timing, anti-MEV slippage guards, and bribe prioritization.',
        inline: false
      },
      {
        name: '🛡️ 2. Advanced Rug & Dev Wallet Forensics',
        value: '• Identify developer bundle launches, insider wallet rings, and wash volume.\n• Analyzing bubble maps, mint/freeze authorities, and LP lock contracts.',
        inline: false
      },
      {
        name: '📊 3. Scalping & Risk Management System',
        value: '• Systematic Take-Profit triggers (+25% / +50% / +100% moonbags).\n• Moving stop losses to breakeven to eliminate drawdowns and capital bleed.',
        inline: false
      },
      {
        name: '💰 4. Client Capital Allocation (Funded Accounts)',
        value: '• Qualified mentees gain access to our proprietary capital pool.\n• Keep up to 80% of your trading profits with zero personal downside risk.',
        inline: false
      }
    )
    .setFooter({ text: 'Click the button below to schedule an interview or apply' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_mentorship_ticket')
      .setLabel('🚀 Apply For Mentorship / Capital')
      .setStyle(ButtonStyle.Success)
      .setEmoji('💎')
  );

  return { embeds: [embed], components: [row] };
}

function getSupportDeskEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🎫 MOZZEX OFFICIAL SUPPORT DESK')
    .setDescription(
      `Welcome to the **Mozzex Support Hub**.\n\n` +
      `If you need assistance regarding:\n` +
      `• **Role Assignment & Access**\n` +
      `• **Trading Mentorship Inquiries**\n` +
      `• **Client Capital Onboarding**\n` +
      `• **Scam / User Reports**\n` +
      `• **Partnerships & Collaborations**\n\n` +
      `Click the button below to spawn a private, secure ticket channel with the Mozzex leadership team.`
    )
    .addFields(
      {
        name: '⏱️ Response Times',
        value: 'Our staff reviews tickets promptly within operating hours. Please provide full context immediately upon opening your ticket.',
        inline: false
      }
    )
    .setFooter({ text: 'Tickets are confidential and logged for member safety.' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_support_ticket')
      .setLabel('📩 Open Support Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫')
  );

  return { embeds: [embed], components: [row] };
}

function getImportantInfoEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.gold)
    .setTitle('💼 CLIENT CAPITAL — PROGRAM OVERVIEW & GUIDELINES')
    .setDescription(
      `This category is strictly dedicated to **Funded Traders, Capital Partners, and High-Volume Operators** participating in the Mozzex Capital Program.\n\n` +
      `**Core Operating Rules:**\n` +
      `1. **Maximum Drawdown**: Traders must not exceed the daily 15% drawdown threshold on allocated capital.\n` +
      `2. **Eligible Pairs**: Capital may be traded on audited Solana pairs with >= $20,000 USD liquidity.\n` +
      `3. **Profit Splits**: Tier 1 splits are 70/30 in favor of the trader; Tier 2 (Senior) splits scale to 80/20.\n` +
      `4. **Payout Cycles**: Payouts are settled bi-weekly in SOL or USDC directly to verified cold wallets.\n\n` +
      `*For questions or to request balance increases, open a ticket in <#client-support>.*`
    )
    .setFooter({ text: 'Mozzex Capital Partners • Institutional Quality Execution' })
    .setTimestamp();

  return { embeds: [embed] };
}

function getVouchesEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('⭐ MOZZEX TRADER & CLIENT REPUTATION')
    .setDescription(
      `Transparency and trust are paramount in trading. This channel serves as the permanent record of verified community and client feedback.\n\n` +
      `**How to leave an official vouch:**\n` +
      `Use the slash command:\n` +
      `\`\`\`\n/vouch trader:@user rating:5 comment:Great callout on $PUMP! proof:<image_attachment>\n\`\`\`\n\n` +
      `**Vouching Requirements:**\n` +
      `• Must include constructive feedback.\n` +
      `• Attach a screenshot proof of trade or service when possible.\n` +
      `• Fabricating fake vouches will result in instant blacklist.`
    )
    .setFooter({ text: 'All vouches are recorded into the Mozzex database.' });

  return { embeds: [embed] };
}

function getClientSupportEmbed() {
  const embed = new EmbedBuilder()
    .setColor(config.colors.gold)
    .setTitle('💎 CLIENT CAPITAL PRIORITY DESK')
    .setDescription(
      `Direct line to Mozzex Managing Partners for funded traders and capital clients.\n\n` +
      `Use this desk for:\n` +
      `• Capital allocation top-ups & balance rebalancing\n` +
      `• Bi-weekly payout settlement requests\n` +
      `• Private custom RPC & node access inquiries\n` +
      `• Urgent portfolio risk escalations`
    )
    .setFooter({ text: 'Priority queue: Average response under 15 minutes.' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_client_ticket')
      .setLabel('💎 Open Client Priority Ticket')
      .setStyle(ButtonStyle.Success)
      .setEmoji('💼')
  );

  return { embeds: [embed], components: [row] };
}

module.exports = {
  getRulesEmbed,
  getAnnouncementsEmbed,
  getMentorshipEmbed,
  getSupportDeskEmbed,
  getImportantInfoEmbed,
  getVouchesEmbed,
  getClientSupportEmbed
};
