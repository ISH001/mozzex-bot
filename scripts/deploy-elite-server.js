const path = require('path');
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require('discord.js');
const config = require('../config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const logoPath = path.join(__dirname, '..', 'assets', 'MOZZEX Trading Community Icon.png');

async function purgeBotMessages(channel, limit = 25) {
  try {
    const messages = await channel.messages.fetch({ limit });
    const botMessages = messages.filter(m => m.author.id === client.user.id);
    if (botMessages.size > 0) {
      console.log(`Purging ${botMessages.size} previous bot messages in #${channel.name}...`);
      await channel.bulkDelete(botMessages, true).catch(async () => {
        for (const [, msg] of botMessages) {
          await msg.delete().catch(() => {});
        }
      });
    }
  } catch (err) {
    console.warn(`Could not purge in #${channel.name}: ${err.message}`);
  }
}

client.once('ready', async () => {
  console.log(`[Elite Deployer] Connected as ${client.user.tag}`);

  const guild = client.guilds.cache.get('1564915473114730566') || client.guilds.cache.first();
  if (!guild) {
    console.error('Could not find MOZZEX server!');
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`🚀 DEPLOYING ELITE MOZZEX SERVER SETUP: "${guild.name}"`);
  console.log(`======================================================\n`);

  // --- PART 1: ROLES & PERMISSIONS SETUP ---
  console.log('--- Step 1: Auditing & Locking Roles and Permissions ---');
  const everyone = guild.roles.everyone;

  const founderRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('FOUNDER'));
  const adminRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('ADMIN'));
  const staffRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('STAFF') || r.name.toUpperCase().includes('SUPPORT'));
  const premiumRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('PREMIUM'));
  const memberRole = guild.roles.cache.find(r => r.name.toUpperCase() === 'MEMBERS' || r.name.toUpperCase() === 'MEMBER');

  console.log(`Founder Role: ${founderRole ? founderRole.name : 'Not Found'}`);
  console.log(`Admin Role:   ${adminRole ? adminRole.name : 'Not Found'}`);
  console.log(`Staff Role:   ${staffRole ? staffRole.name : 'Not Found'}`);
  console.log(`Premium Role: ${premiumRole ? premiumRole.name : 'Not Found'}`);
  console.log(`Member Role:  ${memberRole ? memberRole.name : 'Not Found'}`);

  const channels = await guild.channels.fetch();

  for (const [, channel] of channels) {
    if (!channel) continue;
    const name = channel.name.toLowerCase();

    // 1. STAFF HQ (Strictly Staff / Admin / Founder)
    if (name.includes('staff') || name.includes('mod-log') || name.includes('member-report') || name.includes('sales-tracking') || name.includes('staff-planning')) {
      try {
        const overwrites = [
          { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
        ];
        if (memberRole) overwrites.push({ id: memberRole.id, deny: [PermissionFlagsBits.ViewChannel] });
        if (premiumRole) overwrites.push({ id: premiumRole.id, deny: [PermissionFlagsBits.ViewChannel] });
        if (staffRole) overwrites.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] });
        if (adminRole) overwrites.push({ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] });
        if (founderRole) overwrites.push({ id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] });

        await channel.permissionOverwrites.set(overwrites);
        console.log(`🔒 [Staff HQ Protected] #${channel.name}`);
      } catch (err) {
        console.error(`Error locking #${channel.name}:`, err.message);
      }
      continue;
    }

    // 2. MEMBERS / VIP (Strictly Premium Members & Staff)
    if (name.includes('members') || name.includes('premium') || name.includes('insider-broadcast') || name.includes('ask-your-mentor')) {
      try {
        const overwrites = [
          { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
        ];
        if (memberRole) overwrites.push({ id: memberRole.id, deny: [PermissionFlagsBits.ViewChannel] });
        if (premiumRole) {
          overwrites.push({
            id: premiumRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AddReactions
            ]
          });
        }
        if (staffRole) overwrites.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
        if (adminRole) overwrites.push({ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
        if (founderRole) overwrites.push({ id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

        await channel.permissionOverwrites.set(overwrites);
        console.log(`💎 [VIP Access Protected] #${channel.name}`);
      } catch (err) {
        console.error(`Error locking VIP channel #${channel.name}:`, err.message);
      }
      continue;
    }

    // 3. READ-ONLY PUBLIC CHANNELS (Rules, Announcements, Mentorship, Important Info, Vouches, Support Desks)
    if (
      name.includes('rules') ||
      name.includes('announcement') ||
      name.includes('mentor') ||
      name.includes('important') ||
      name.includes('vouches') ||
      name.includes('support')
    ) {
      try {
        await channel.permissionOverwrites.edit(everyone, {
          ViewChannel: true,
          SendMessages: false,
          AddReactions: true,
          ReadMessageHistory: true
        });
        if (staffRole) await channel.permissionOverwrites.edit(staffRole, { SendMessages: true });
        if (adminRole) await channel.permissionOverwrites.edit(adminRole, { SendMessages: true });
        console.log(`🛡️ [Read-Only Configured] #${channel.name}`);
      } catch (err) {
        console.error(`Error setting read-only on #${channel.name}:`, err.message);
      }
      continue;
    }

    // 4. COMMUNITY CHANNELS (Public Chatting, Charts, Setups, Introductions, Feedback)
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
        console.log(`💬 [Community Open] #${channel.name}`);
      } catch (err) {
        console.error(`Error configuring community #${channel.name}:`, err.message);
      }
      continue;
    }
  }

  // --- PART 2: PUBLISHING ELITE EMBEDS WITH BRANDED LOGO ---
  console.log('\n--- Step 2: Publishing Branded Embeds with Mozzex Logo ---');

  // Helper to create an attachment
  const createLogo = () => new AttachmentBuilder(logoPath, { name: 'mozzex-logo.png' });

  // 1. #server-rules
  const rulesChannel = guild.channels.cache.find(c => c.name.includes('rules'));
  if (rulesChannel) {
    await purgeBotMessages(rulesChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00FFA3) // Solana Cyber Green
      .setAuthor({ name: 'MOZZEX TRADING NETWORK', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('⚡ OFFICIAL RULES & CODE OF CONDUCT')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> **Welcome to MOZZEX.** We are an elite memecoin trading and on-chain intelligence network. To safeguard member capital and preserve a disciplined, professional trading environment, the following rules are strictly enforced.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '1️⃣  🛡️ Zero-Tolerance For Malicious Links & Drainers',
          value: 'Posting smart contract honeypots, drainers, fake mint links, or malicious bots results in an **immediate permanent IP ban**, bot report, and blacklisting across allied crypto networks.',
          inline: false
        },
        {
          name: '2️⃣  🚫 Strict Anti-Impersonation & No-DM Rule',
          value: 'Mozzex Founders, Mentors, and Bots will **NEVER** DM you first offering "private allocations", "presale claims", or asking for wallet seed phrases / private keys.\nAnyone messaging you privately claiming to be staff is an **impersonator** — report them in <#1567566692626735144>.',
          inline: false
        },
        {
          name: '3️⃣  📉 High-Volatility & Trading Risk Disclosure',
          value: 'Memecoins and micro-cap tokens are inherently volatile and speculative. **Never trade with money you cannot afford to lose.**\nAll calls, charts, and discussion in this community are for educational & analytical purposes only and **do not constitute financial advice (DYOR)**.',
          inline: false
        },
        {
          name: '4️⃣  🤝 Respectful Degen Conduct',
          value: 'Respect your fellow traders. Constructive debate, technical analysis, and contrarian opinions are welcomed.\nToxic harassment, personal attacks, hate speech, or intentional panic-dump FUD will result in an instant timeout or removal.',
          inline: false
        },
        {
          name: '5️⃣  📢 No Unsolicited Promotion or Ref Shilling',
          value: 'Do not advertise outside Telegram groups, private paid alpha discords, or unvetted affiliate links without explicit written approval from leadership.',
          inline: false
        }
      )
      .setFooter({ text: 'Mozzex Trading Network • Built for Degens, Mentored for Profit', iconURL: 'attachment://mozzex-logo.png' })
      .setTimestamp();

    await rulesChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Rules in #${rulesChannel.name}`);
  }

  // 2. #announcements
  const annChannel = guild.channels.cache.find(c => c.name.includes('announcement') && !c.name.includes('staff'));
  if (annChannel) {
    await purgeBotMessages(annChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00E5FF) // Laser Cyan
      .setAuthor({ name: 'MOZZEX TRADING NETWORK', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('🚀 WELCOME TO MOZZEX — THE ALPHA & TRADING HUB')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> **Mozzex is where high-speed on-chain execution meets disciplined risk management.** We provide the tools, scanners, and community intelligence required to consistently extract liquidity from the Solana and EVM memecoin markets.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '🗺️ Server Roadmap & Quick Navigation',
          value:
            '• <#1567566433620201772> — Review our security & conduct policies.\n' +
            '• <#1567567007682011296> — Say hello and tell us what chains you trade.\n' +
            '• <#1567537487637647380> — Live market discussion & token chatter.\n' +
            '• <#1567567158261584073> — Share charts, CAs, and technical setups.\n' +
            '• <#1567567196148858960> — Post your realized gains using `/pnl`.\n' +
            '• <#1567566644413333514> — Discover our 1-on-1 coaching & funded accounts.\n' +
            '• <#1567566692626735144> — Need help? Open a private ticket anytime.',
          inline: false
        },
        {
          name: '⚡ Built-In Trading & Utility Commands',
          value:
            '• `/scan <address>` — Real-time DexScreener stats, liquidity & rug checks.\n' +
            '• `/call <address> <entry_mc>` — Official alpha callout formatting.\n' +
            '• `/pnl <token> <profit_sol> <roi_%>` — Generate custom PnL cards.\n' +
            '• `/invites` & `/topinvites` — Live referral and community leaderboard.',
          inline: false
        }
      )
      .setFooter({ text: 'Mozzex Ecosystem • Live Updates & Announcements', iconURL: 'attachment://mozzex-logo.png' })
      .setTimestamp();

    await annChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Announcements in #${annChannel.name}`);
  }

  // 3. #trading-mentorship
  const mentorChannel = guild.channels.cache.find(c => c.name.includes('mentor') && !c.name.includes('ask'));
  if (mentorChannel) {
    await purgeBotMessages(mentorChannel);
    const embed = new EmbedBuilder()
      .setColor(0xFFB800) // Elite Trading Gold
      .setAuthor({ name: 'MOZZEX TRADING ACCELERATOR', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('💎 ON-CHAIN MENTORSHIP & CLIENT CAPITAL')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> **Stop donating your SOL to ruggers and bundle snipers.** The **Mozzex Accelerator** is designed to take retail degens and mold them into calculated, disciplined on-chain operators with institutional execution speed.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '⚡ 1. On-Chain Sniping & Speed Architecture',
          value: '• Configuration of Photon, BullX, Axiom, and private Jito RPC endpoints.\n• Anti-MEV bribe parameters, dynamic slippage optimization, and bundle entry timing.',
          inline: false
        },
        {
          name: '🛡️ 2. Dev Wallet Forensics & Rug Detection',
          value: '• Spotting developer wash trading, multi-wallet funding rings, and fake volume.\n• Reading bubble maps, liquidity migration, and pump.fun graduation patterns.',
          inline: false
        },
        {
          name: '📊 3. Scalping & Risk Management Framework',
          value: '• Systematic take-profit scaling (+25% / +50% / +100% / moonbag runners).\n• Trailing stop-loss triggers to mathematically lock in gains and eliminate drawdowns.',
          inline: false
        },
        {
          name: '💰 4. Client Capital Allocation (Funded Accounts)',
          value: '• Proven mentees receive direct access to our proprietary capital trading pool.\n• **Trade with our capital — keep up to 80% of net profits** with zero personal financial risk.',
          inline: false
        }
      )
      .setFooter({ text: 'Click the button below to apply for Mentorship or Capital', iconURL: 'attachment://mozzex-logo.png' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_mentorship_ticket')
        .setLabel('🚀 Apply For Mentorship & Capital')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💎')
    );

    await mentorChannel.send({ embeds: [embed], components: [row], files: [createLogo()] });
    console.log(`✅ [Published] Elite Mentorship in #${mentorChannel.name}`);
  }

  // 4. #support-desk
  const supportChannel = guild.channels.cache.find(c => c.name.includes('support-desk'));
  if (supportChannel) {
    await purgeBotMessages(supportChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00FFA3)
      .setAuthor({ name: 'MOZZEX HELP DESK', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('🎫 OFFICIAL SUPPORT & INQUIRY DESK')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> Need assistance with server roles, mentorship enrollment, partnership inquiries, or reporting a suspicious user? Click below to open a private encrypted ticket with Mozzex leadership.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '📋 Supported Inquiries',
          value:
            '• **Mentorship Applications** — Interview scheduling & tier onboarding.\n' +
            '• **Client Capital Support** — Allocation requests & profit settlement.\n' +
            '• **Role & Access Inquiries** — VIP pass verification & badge setup.\n' +
            '• **Security & Reports** — Report impersonators, scam DMs, or drainers.',
          inline: false
        },
        {
          name: '⏱️ Response Standard',
          value: 'Our team reviews tickets promptly. Please provide full context immediately upon opening your ticket.',
          inline: false
        }
      )
      .setFooter({ text: 'Tickets are confidential and logged for member safety.', iconURL: 'attachment://mozzex-logo.png' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_support_ticket')
        .setLabel('📩 Open Support Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎫')
    );

    await supportChannel.send({ embeds: [embed], components: [row], files: [createLogo()] });
    console.log(`✅ [Published] Elite Support Desk in #${supportChannel.name}`);
  }

  // 5. #important-info (CLIENT-CAPITAL)
  const importantChannel = guild.channels.cache.find(c => c.name.includes('important-info'));
  if (importantChannel) {
    await purgeBotMessages(importantChannel);
    const embed = new EmbedBuilder()
      .setColor(0xFFB800)
      .setAuthor({ name: 'MOZZEX CAPITAL PARTNERS', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('💼 CLIENT CAPITAL — RULES & OPERATING POLICY')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> This desk is reserved exclusively for **Funded Traders, Capital Partners, and High-Volume Operators** participating in the Mozzex Capital Network.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '🛡️ 1. Risk Limits & Drawdown Controls',
          value: '• **Maximum Daily Drawdown:** 15% of allocated balance. Exceeding this halts trading.\n• **Permitted Trading Pairs:** Solana audited pairs with minimum $20,000 USD liquidity.',
          inline: false
        },
        {
          name: '💰 2. Profit Split Tiers',
          value: '• **Tier 1 (Junior Operator):** 70% Trader / 30% Mozzex Capital.\n• **Tier 2 (Senior Sniper):** 80% Trader / 20% Mozzex Capital.',
          inline: false
        },
        {
          name: '📅 3. Settlement & Payout Cycles',
          value: '• Payouts are settled bi-weekly via **SOL** or **USDC** directly to verified cold wallets.\n• Profit splits are calculated on realized net wallet growth minus on-chain gas/priority fees.',
          inline: false
        }
      )
      .setFooter({ text: 'Mozzex Capital • Institutional Quality Execution', iconURL: 'attachment://mozzex-logo.png' })
      .setTimestamp();

    await importantChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Important Info in #${importantChannel.name}`);
  }

  // 6. #vouches (CLIENT-CAPITAL)
  const vouchesChannel = guild.channels.cache.find(c => c.name.includes('vouches'));
  if (vouchesChannel) {
    await purgeBotMessages(vouchesChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00FFA3)
      .setAuthor({ name: 'MOZZEX REPUTATION SYSTEM', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('⭐ TRADER & CLIENT REPUTATION REPOSITORY')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> **Integrity and verifiable track records define the Mozzex standard.** All verified community vouches, client payouts, and mentorship reviews are permanently cataloged in this channel.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '📝 How to Submit an Official Vouch:',
          value:
            'Use the slash command:\n' +
            '```\n/vouch trader:@user rating:5 comment:Your review here proof:<attach_image>\n```',
          inline: false
        },
        {
          name: '⚖️ Vouch Verification Standards:',
          value:
            '• **Honest feedback:** Detail your trade, caller setup, or mentorship session.\n' +
            '• **Proof attachment:** Include a screenshot of the trade entry/exit or payout.\n' +
            '• **Anti-Fraud Guard:** Fabricating false reviews results in an instant ban and blacklist.',
          inline: false
        }
      )
      .setFooter({ text: 'Mozzex Reputation System • Transparent On-Chain Community', iconURL: 'attachment://mozzex-logo.png' });

    await vouchesChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Vouches Guide in #${vouchesChannel.name}`);
  }

  // 7. #client-support (CLIENT-CAPITAL)
  const clientSupportChannel = guild.channels.cache.find(c => c.name.includes('client-support'));
  if (clientSupportChannel) {
    await purgeBotMessages(clientSupportChannel);
    const embed = new EmbedBuilder()
      .setColor(0xFFB800)
      .setAuthor({ name: 'MOZZEX CAPITAL PARTNERS', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('💎 CLIENT CAPITAL PRIORITY SUPPORT DESK')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> Direct priority communication line to Mozzex Managing Partners for funded traders and capital allocation clients.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '⚡ Priority Queue Services',
          value:
            '• Capital allocation top-ups & balance rebalancing.\n' +
            '• Bi-weekly profit payout processing.\n' +
            '• Dedicated private RPC endpoints & Jito block-engine access.\n' +
            '• Urgent portfolio risk & liquidation assistance.',
          inline: false
        }
      )
      .setFooter({ text: 'Priority Queue • Fast response from Managing Partners', iconURL: 'attachment://mozzex-logo.png' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_client_ticket')
        .setLabel('💎 Open Client Priority Ticket')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💼')
    );

    await clientSupportChannel.send({ embeds: [embed], components: [row], files: [createLogo()] });
    console.log(`✅ [Published] Elite Client Support in #${clientSupportChannel.name}`);
  }

  // 8. #introductions (COMMUNITY)
  const introChannel = guild.channels.cache.find(c => c.name.includes('intro'));
  if (introChannel) {
    await purgeBotMessages(introChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00E5FF)
      .setAuthor({ name: 'MOZZEX COMMUNITY FLOOR', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('🤝 WELCOME TO MOZZEX — INTRODUCE YOURSELF!')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> Welcome to the floor! Introduce yourself to fellow traders using the template below:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `\`\`\`\n` +
        `• Nickname / Handle:\n` +
        `• Chains I Trade (Solana, Base, ETH):\n` +
        `• Trading Style (Scalp, Sniping, Swing, Moonbag):\n` +
        `• Favorite Tools (Photon, BullX, Axiom, DexScreener):\n` +
        `• Monthly Trading Goal:\n` +
        `\`\`\`\n` +
        `*New members automatically receive the <@&1567753567643770890> role.*`
      )
      .setFooter({ text: 'Mozzex Community • Connect with fellow traders', iconURL: 'attachment://mozzex-logo.png' });

    await introChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Introductions in #${introChannel.name}`);
  }

  // 9. #trading-setups (COMMUNITY)
  const setupsChannel = guild.channels.cache.find(c => c.name.includes('trading-setup'));
  if (setupsChannel) {
    await purgeBotMessages(setupsChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00FFA3)
      .setAuthor({ name: 'MOZZEX TRADING FLOOR', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('📸 TRADING SETUPS & ALPHA SHARING')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> Share your live charts, token breakouts, and on-chain catalysts here.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `**Best Practices For Posting Setups:**\n` +
        `1. **Post Contract Address (CA)** as plain text so mobile traders can 1-tap copy.\n` +
        `2. **Attach Chart:** Include a clean DexScreener, BullX, or Photon screenshot.\n` +
        `3. **State Your Thesis:** Entry MC, expected volume catalyst, and your stop-loss level.\n` +
        `4. **Scan The Token:** Use \`/scan <ca>\` to generate quick liquidity and safety metrics!`
      )
      .setFooter({ text: 'Mozzex Floor • Data-driven setups only', iconURL: 'attachment://mozzex-logo.png' });

    await setupsChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Setups in #${setupsChannel.name}`);
  }

  // 10. #profits-and-milestones (COMMUNITY)
  const profitsChannel = guild.channels.cache.find(c => c.name.includes('profit'));
  if (profitsChannel) {
    await purgeBotMessages(profitsChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00FFA3)
      .setAuthor({ name: 'MOZZEX WALL OF WINS', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('🏆 PROFITS & TRADING MILESTONES')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> **Executed a green trade? Scalped a runner? Hit a 10x? Flex it here.**\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `**How to Generate an Official PnL Card:**\n` +
        `\`\`\`\n` +
        `/pnl token:$TICKER profit_sol:15.5 roi_pct:380 holding_time:"30 mins"\n` +
        `\`\`\`\n` +
        `Attach your Phantom, Solflare, BullX, or Photon proof to inspire the community!`
      )
      .setFooter({ text: 'Mozzex Wall of Wins • Consistency over luck', iconURL: 'attachment://mozzex-logo.png' });

    await profitsChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Profits in #${profitsChannel.name}`);
  }

  // 11. #insider-broadcasts (MEMBERS VIP)
  const insiderChannel = guild.channels.cache.find(c => c.name.includes('insider-broadcast'));
  if (insiderChannel) {
    await purgeBotMessages(insiderChannel);
    const embed = new EmbedBuilder()
      .setColor(0xFFB800)
      .setAuthor({ name: 'MOZZEX VIP ALPHA', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('👑 INSIDER BROADCASTS & ALPHA DISPATCH')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> **Welcome to the Inner Circle.** This feed is restricted exclusively to **Premium Members** and **Funded Capital Partners**.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• **High-Conviction Early Snipes** curated by Mozzex founders & mentors.\n` +
        `• **Whale & Insider Wallet Tracking** alerts before tokens migrate.\n` +
        `• **Early pump.fun bonding curve graduation snipes**.\n` +
        `• **Pre-market market analysis and developer forensics**.\n\n` +
        `*Turn on channel notifications so you never miss a sub-second signal.*`
      )
      .setFooter({ text: 'Mozzex VIP Alpha • Strictly Confidential', iconURL: 'attachment://mozzex-logo.png' });

    await insiderChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Insider Broadcasts in #${insiderChannel.name}`);
  }

  // 12. #premium-resources (MEMBERS VIP)
  const resourcesChannel = guild.channels.cache.find(c => c.name.includes('premium-resource'));
  if (resourcesChannel) {
    await purgeBotMessages(resourcesChannel);
    const embed = new EmbedBuilder()
      .setColor(0x00E5FF)
      .setAuthor({ name: 'MOZZEX VIP VAULT', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('📚 VIP TRADING VAULT & PROPRIETARY RESOURCES')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> Elite configurations, RPC links, and frameworks for high-speed trading.\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `• **High-Speed RPC Endpoints:** Private Jito / Helius / QuickNode low-latency setups.\n` +
        `• **Bot Presets:** Optimized Photon & BullX gas fees, slippage & MEV protection.\n` +
        `• **Risk Calculator:** Position sizing spreadsheets & drawdown control guides.\n` +
        `• **Mentorship Replays:** Recorded deep dives and live chart breakdowns.`
      )
      .setFooter({ text: 'Mozzex VIP Vault • Exclusively for Premium Members', iconURL: 'attachment://mozzex-logo.png' });

    await resourcesChannel.send({ embeds: [embed], files: [createLogo()] });
    console.log(`✅ [Published] Elite Premium Resources in #${resourcesChannel.name}`);
  }

  console.log(`\n🎉 ALL 12 ELITE EMBEDS & PERMISSIONS DEPLOYED FLAWLESSLY!`);
  process.exit(0);
});

client.login(config.token).catch(err => {
  console.error('[Elite Deployer] Login failed:', err);
  process.exit(1);
});
