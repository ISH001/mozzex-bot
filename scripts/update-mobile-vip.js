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
const createLogo = () => new AttachmentBuilder(logoPath, { name: 'mozzex-logo.png' });

client.once('ready', async () => {
  console.log(`[Mobile & VIP Update] Logged in as ${client.user.tag}`);
  const guild = client.guilds.cache.get('1564915473114730566') || client.guilds.cache.first();
  if (!guild) {
    console.error('MOZZEX server not found!');
    process.exit(1);
  }

  const everyone = guild.roles.everyone;
  const staffRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('STAFF') || r.name.toUpperCase().includes('SUPPORT'));
  const adminRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('ADMIN'));
  const founderRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('FOUNDER'));
  const premiumRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('PREMIUM'));

  const readOnlyPerms = [
    {
      id: everyone.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions],
      deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.CreatePrivateThreads]
    }
  ];
  if (staffRole) readOnlyPerms.push({ id: staffRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] });
  if (adminRole) readOnlyPerms.push({ id: adminRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] });
  if (founderRole) readOnlyPerms.push({ id: founderRole.id, allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel] });

  // Find or create category for MOZZEX CAPITAL
  let catCapital = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.includes('MOZZEX CAPITAL'));
  if (!catCapital) {
    catCapital = await guild.channels.create({
      name: '💰 MOZZEX CAPITAL',
      type: ChannelType.GuildCategory,
      position: 1
    });
  }

  // 1. Ensure #investment-packages exists
  let chPackages = guild.channels.cache.find(c => c.name.includes('investment-package'));
  if (!chPackages) {
    chPackages = await guild.channels.create({
      name: '💎・investment-packages',
      type: ChannelType.GuildText,
      parent: catCapital.id,
      permissionOverwrites: readOnlyPerms
    });
  }

  // 2. Ensure #vip-lifetime-pass exists
  let chVip = guild.channels.cache.find(c => c.name.includes('vip-lifetime') || c.name.includes('lifetime-vip'));
  if (!chVip) {
    chVip = await guild.channels.create({
      name: '👑・vip-lifetime-pass',
      type: ChannelType.GuildText,
      parent: catCapital.id,
      permissionOverwrites: readOnlyPerms
    });
    console.log('Created #vip-lifetime-pass');
  }

  // 3. Ensure #support-desk exists
  const chSupport = guild.channels.cache.find(c => c.name.includes('support-desk'));

  async function wipeChannel(ch) {
    try {
      const msgs = await ch.messages.fetch({ limit: 50 });
      if (msgs.size > 0) {
        await ch.bulkDelete(msgs, true).catch(async () => {
          for (const [, m] of msgs) await m.delete().catch(() => {});
        });
      }
    } catch (e) {}
  }

  // --- PART 1: POST MOBILE-OPTIMIZED #investment-packages ---
  console.log('Posting mobile-optimized #investment-packages...');
  await wipeChannel(chPackages);

  const packageEmbed = new EmbedBuilder()
    .setColor(0xD4AF37) // Metallic Gold
    .setAuthor({ name: 'MOZZEX MANAGED CAPITAL', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('💎 INVESTMENT PACKAGES & 50/50 PROFIT SYSTEM')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> **Zero Experience Required.** You don't need to know charts, timing, or technical trading.\n` +
      `> 1. You choose a package and pick your duration.\n` +
      `> 2. We set up your personal **FOMO profile** to trade on your behalf.\n` +
      `> 3. Once the term completes, **your full capital is returned + 50% of the profits**!\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '🥉 STARTER PACKAGE — $10 to $25',
        value:
          '• **Duration:** `24 to 48 Hours`\n' +
          '• **Profit Split:** `50% You / 50% Mozzex`\n' +
          '• **Tracking:** Dedicated Live FOMO Profile Link\n' +
          '• **Target:** Perfect for beginners testing with pocket change.',
        inline: false
      },
      {
        name: '🥈 GROWTH PACKAGE — $30 to $75',
        value:
          '• **Duration:** `3 to 5 Days`\n' +
          '• **Profit Split:** `50% You / 50% Mozzex`\n' +
          '• **Tracking:** Dedicated Live FOMO Profile Link\n' +
          '• **Target:** Steady compounding across vetted memecoin setups.',
        inline: false
      },
      {
        name: '🥇 PRO PACKAGE — $100 to $250',
        value:
          '• **Duration:** `5 to 7 Days`\n' +
          '• **Profit Split:** `50% You / 50% Mozzex`\n' +
          '• **Tracking:** Dedicated Live FOMO Profile Link\n' +
          '• **Target:** Multi-token allocation with aggressive profit capture.',
        inline: false
      },
      {
        name: '💎 ELITE WHALE — $500 to $1,000+',
        value:
          '• **Duration:** `7 to 14 Days`\n' +
          '• **Profit Split:** `50% You / 50% Mozzex`\n' +
          '• **Tracking:** Dedicated Live FOMO Profile Link + 1-on-1 Updates\n' +
          '• **Target:** Institutional-tier sniping with private RPC allocation.',
        inline: false
      },
      {
        name: '📱 100% Live FOMO Transparency (Watch Every Trade)',
        value:
          'Unlike other platforms where your money disappears into a mystery wallet, **we set up a personal FOMO profile for your account**. You receive a private live link to watch every buy, sell, balance, and profit tick in real time on your phone 24/7.',
        inline: false
      },
      {
        name: '💡 The 50% Profit Split — Simple Math Example',
        value:
          '• You invest: **$100 USD**\n' +
          '• We generate: **+$50 USD Profit**\n' +
          '• Mozzex Share (50%): **$25 USD**\n' +
          '• Your Share (50%): **$25 USD**\n' +
          '• 💰 **Your Total Payout: $125 USD** ($100 Principal Returned + $25 Profit!)\n\n' +
          '*Your initial principal deposit is 100% returned to you alongside your profit payout.*',
        inline: false
      },
      {
        name: '💳 Accepted Currencies',
        value: '• **Solana (SOL)**\n• **Litecoin (LTC)** *(Fast & Ultra-Low Fees)*\n• **USDT** *(TRC20 / BEP20)*\n• **Bitcoin (BTC)**',
        inline: false
      }
    )
    .setFooter({ text: 'Mozzex Capital • Transparent On-Chain Wealth', iconURL: 'attachment://mozzex-logo.png' })
    .setTimestamp();

  const pkgRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_invest_ticket')
      .setLabel('🚀 Start Investment / Open Ticket')
      .setStyle(ButtonStyle.Success)
      .setEmoji('💎'),
    new ButtonBuilder()
      .setCustomId('buy_vip_ticket')
      .setLabel('👑 Buy Lifetime VIP ($50)')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📚')
  );

  await chPackages.send({ embeds: [packageEmbed], components: [pkgRow], files: [createLogo()] });
  console.log('✅ Posted mobile-friendly #investment-packages');

  // --- PART 2: POST #vip-lifetime-pass ---
  console.log('Posting #vip-lifetime-pass...');
  await wipeChannel(chVip);

  const vipEmbed = new EmbedBuilder()
    .setColor(0xD4AF37) // Luxury Gold
    .setAuthor({ name: 'MOZZEX VIP ACADEMY', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('👑 MOZZEX VIP LIFETIME PASS — $50 USD')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> **Want to learn to trade memecoins yourself? Get our entire proprietary ecosystem for life.**\n` +
      `> For a single one-time payment of **$50 USD** (no monthly subscriptions ever), you unlock our complete suite of trading knowledge books, professional tool setups, step-by-step guidance, and insider alpha signals.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '📚 1. Complete Knowledge Books & E-Books Library',
        value:
          '• **Book 1: "The Degen Starter Blueprint"** — How Solana memecoins work, wallet setups, and avoiding rookie mistakes.\n' +
          '• **Book 2: "The Anti-Scam & Rug Bible"** — Forensic checks to spot dev honeypots, wash trading, and drainers in 60 seconds.\n' +
          '• **Book 3: "Mastering FOMO & Copy Trading"** — How to track profitable insider wallets and copy trade live setups.',
        inline: false
      },
      {
        name: '🛠️ 2. Professional Trading Tools Suite (The Best in the Market)',
        value:
          '• **Photon & BullX Configuration:** Pre-tuned gas fees, anti-MEV protection, and sub-second auto-snipe presets.\n' +
          '• **Axiom & DexScreener Filters:** Our private filters to eliminate 99% of dead micro-caps instantly.\n' +
          '• **Private Low-Latency RPCs:** High-speed endpoints to ensure your transactions never fail during congestion.',
        inline: false
      },
      {
        name: '🎯 3. VIP Insider Alpha Calls & Signals',
        value:
          '• Access to our private **`#👑・vip-alpha`** channel.\n' +
          '• High-conviction calls before tokens pump, with recommended entry Market Cap, targets, and stop losses.',
        inline: false
      },
      {
        name: '🤝 4. Step-by-Step 1-on-1 Tool Setup Assistance',
        value:
          '• We personally walk you through setting up your trading terminals, wallets, and FOMO profile so you can trade with confidence from day one.',
        inline: false
      },
      {
        name: '💰 Lifetime Price: $50 USD (One-Time Payment)',
        value:
          '**No recurring monthly charges. Pay once, keep lifetime access to all future updates, books, and signals.**\n' +
          'Accepted: **SOL**, **LTC**, **USDT**, or **BTC**.',
        inline: false
      }
    )
    .setFooter({ text: 'Mozzex VIP • Knowledge, Tools & Alpha For Life', iconURL: 'attachment://mozzex-logo.png' })
    .setTimestamp();

  const vipRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('buy_vip_ticket')
      .setLabel('👑 Get Lifetime VIP Pass ($50)')
      .setStyle(ButtonStyle.Success)
      .setEmoji('💎'),
    new ButtonBuilder()
      .setCustomId('open_support_ticket')
      .setLabel('❓ Have Questions? Ask Here')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('💬')
  );

  await chVip.send({ embeds: [vipEmbed], components: [vipRow], files: [createLogo()] });
  console.log('✅ Posted #vip-lifetime-pass');

  // --- PART 3: UPDATE #support-desk WITH 3 BUTTONS ---
  if (chSupport) {
    console.log('Updating #support-desk...');
    await wipeChannel(chSupport);

    const supportEmbed = new EmbedBuilder()
      .setColor(0xD4AF37)
      .setAuthor({ name: 'MOZZEX HELP & DESK', iconURL: 'attachment://mozzex-logo.png' })
      .setTitle('🎫 OFFICIAL SUPPORT & ONBOARDING DESK')
      .setThumbnail('attachment://mozzex-logo.png')
      .setDescription(
        `> Welcome to the **Mozzex Official Desk**.\n` +
        `> Select an option below to open a private, encrypted ticket with our team:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      )
      .addFields(
        {
          name: '🚀 1. Managed Capital Investment ($10 – $1,000+)',
          value: 'Choose your package and duration. We trade on your behalf via a personal FOMO profile with a 50/50 profit split.',
          inline: false
        },
        {
          name: '👑 2. Lifetime VIP Membership ($50 USD)',
          value: 'Instant delivery of our complete Knowledge Books, best trading tools, 1-on-1 step-by-step setup, and VIP alpha signals.',
          inline: false
        },
        {
          name: '💬 3. General Support & Inquiries',
          value: 'Questions about wallet setups, deposit methods, or general help.',
          inline: false
        }
      )
      .setFooter({ text: 'Confidential & Secure • Average response under 15 minutes', iconURL: 'attachment://mozzex-logo.png' });

    const supportRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_invest_ticket')
        .setLabel('🚀 Start Investment')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💎'),
      new ButtonBuilder()
        .setCustomId('buy_vip_ticket')
        .setLabel('👑 Buy Lifetime VIP ($50)')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📚'),
      new ButtonBuilder()
        .setCustomId('open_support_ticket')
        .setLabel('📩 General Support')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎫')
    );

    await chSupport.send({ embeds: [supportEmbed], components: [supportRow], files: [createLogo()] });
    console.log('✅ Updated #support-desk');
  }

  console.log('\n🎉 ALL UPDATES DEPLOYED FLAWLESSLY FOR MOBILE & VIP!');
  process.exit(0);
});

client.login(config.token).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
