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
  console.log(`[Simplify Server] Logged in as ${client.user.tag}`);
  const guild = client.guilds.cache.get('1564915473114730566') || client.guilds.cache.first();
  if (!guild) {
    console.error('MOZZEX server not found!');
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`✨ RESTRUCTURING & SIMPLIFYING MOZZEX SERVER: "${guild.name}"`);
  console.log(`======================================================\n`);

  const everyone = guild.roles.everyone;
  const founderRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('FOUNDER'));
  const adminRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('ADMIN'));
  const staffRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('STAFF') || r.name.toUpperCase().includes('SUPPORT'));
  const premiumRole = guild.roles.cache.find(r => r.name.toUpperCase().includes('PREMIUM'));
  const memberRole = guild.roles.cache.find(r => r.name.toUpperCase() === 'MEMBERS' || r.name.toUpperCase() === 'MEMBER');

  // Fetch all current channels
  const currentChannels = await guild.channels.fetch();

  // 1. DELETE UNNECESSARY CLUTTER CHANNELS
  const channelsToDelete = [
    'trading-mentor',
    'important-info',
    'client-support',
    'client-feedback',
    'trading-setup',
    'profits-and-milestones',
    'introductions',
    'premium-resources',
    'premium-watchlist',
    'ask-your-mentor',
    'premium-support',
    'sales-tracking',
    'staff-planning',
    'member-reports',
    'staff-announcements',
    'CLIENT-CAPITAL' // delete the old category
  ];

  for (const [, ch] of currentChannels) {
    if (!ch) continue;
    const name = ch.name.toLowerCase();
    for (const target of channelsToDelete) {
      if (name.includes(target.toLowerCase())) {
        try {
          console.log(`🗑️ Deleting redundant channel: #${ch.name}`);
          await ch.delete('Simplifying server layout');
        } catch (e) {
          console.warn(`Could not delete #${ch.name}: ${e.message}`);
        }
        break;
      }
    }
  }

  // Refresh channel cache after deletions
  const updatedChannels = await guild.channels.fetch();

  // Helper to find or create category
  async function getOrCreateCategory(catName, position) {
    let cat = updatedChannels.find(c => c && c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes(catName.toLowerCase()));
    if (!cat) {
      cat = await guild.channels.create({
        name: catName,
        type: ChannelType.GuildCategory,
        position
      });
      console.log(`📁 Created Category: ${catName}`);
    }
    return cat;
  }

  // Helper to find or create text channel
  async function getOrCreateTextChannel(chName, parentCategory, position, overwrites = []) {
    let ch = updatedChannels.find(c => c && c.type === ChannelType.GuildText && c.name.toLowerCase().includes(chName.toLowerCase().replace(/[^a-z0-9]/g, '')));
    if (!ch) {
      // also check exact name
      ch = updatedChannels.find(c => c && c.type === ChannelType.GuildText && c.name === chName);
    }
    if (!ch) {
      ch = await guild.channels.create({
        name: chName,
        type: ChannelType.GuildText,
        parent: parentCategory ? parentCategory.id : null,
        position,
        permissionOverwrites: overwrites
      });
      console.log(`📝 Created Channel: #${chName}`);
    } else {
      await ch.setParent(parentCategory ? parentCategory.id : null, { lockPermissions: false }).catch(() => {});
      if (overwrites.length > 0) {
        await ch.permissionOverwrites.set(overwrites).catch(() => {});
      }
      console.log(`🔄 Re-organized Channel: #${ch.name}`);
    }
    return ch;
  }

  // --- BUILD THE NEW CLEAN CATEGORIES & CHANNELS ---

  // Standard permission sets
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

  const communityPerms = [
    {
      id: everyone.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AddReactions
      ],
      deny: [PermissionFlagsBits.MentionEveryone]
    }
  ];

  const investorVipPerms = [
    { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
  ];
  if (memberRole) investorVipPerms.push({ id: memberRole.id, deny: [PermissionFlagsBits.ViewChannel] });
  if (premiumRole) {
    investorVipPerms.push({
      id: premiumRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory
      ]
    });
  }
  if (staffRole) investorVipPerms.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
  if (adminRole) investorVipPerms.push({ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
  if (founderRole) investorVipPerms.push({ id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });

  const staffHqPerms = [
    { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
  ];
  if (memberRole) staffHqPerms.push({ id: memberRole.id, deny: [PermissionFlagsBits.ViewChannel] });
  if (premiumRole) staffHqPerms.push({ id: premiumRole.id, deny: [PermissionFlagsBits.ViewChannel] });
  if (staffRole) staffHqPerms.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] });
  if (adminRole) staffHqPerms.push({ id: adminRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] });
  if (founderRole) staffHqPerms.push({ id: founderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] });

  // 1. 🏛️ GET STARTED
  const catStart = await getOrCreateCategory('🏛️ START HERE', 0);
  const chWelcome = await getOrCreateTextChannel('👋・welcome', catStart, 0, readOnlyPerms);
  const chRules = await getOrCreateTextChannel('📜・rules-and-safety', catStart, 1, readOnlyPerms);
  const chAnnouncements = await getOrCreateTextChannel('📢・announcements', catStart, 2, readOnlyPerms);

  // 2. 💰 MOZZEX CAPITAL
  const catCapital = await getOrCreateCategory('💰 MOZZEX CAPITAL', 1);
  const chPackages = await getOrCreateTextChannel('💎・investment-packages', catCapital, 0, readOnlyPerms);
  const chPayouts = await getOrCreateTextChannel('📸・payouts-and-vouches', catCapital, 1, readOnlyPerms);

  // 3. 💬 COMMUNITY
  const catCommunity = await getOrCreateCategory('💬 COMMUNITY', 2);
  const chGeneral = await getOrCreateTextChannel('💬・general-chat', catCommunity, 0, communityPerms);
  const chSupport = await getOrCreateTextChannel('🎫・support-desk', catCommunity, 1, readOnlyPerms);

  // 4. 👑 INVESTOR LOUNGE (VIP - Hidden from non-investors)
  const catInvestor = await getOrCreateCategory('👑 INVESTOR VIP', 3);
  await catInvestor.permissionOverwrites.set(investorVipPerms);
  const chInvestorChat = await getOrCreateTextChannel('💬・investor-chat', catInvestor, 0, investorVipPerms);
  const chLiveTrades = await getOrCreateTextChannel('📊・live-trades', catInvestor, 1, investorVipPerms);

  // 5. ⚙️ STAFF HQ (Hidden from everyone except staff)
  const catStaff = await getOrCreateCategory('⚙️ STAFF HQ', 4);
  await catStaff.permissionOverwrites.set(staffHqPerms);
  const chStaffChat = await getOrCreateTextChannel('💬・staff-chat', catStaff, 0, staffHqPerms);
  const chModLogs = await getOrCreateTextChannel('📝・mod-logs', catStaff, 1, staffHqPerms);

  // --- PART 2: PURGE & SEND PREMIUM MESSAGES ---
  console.log('\n--- Step 2: Publishing Clean, Luxury Branded Messages ---');

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

  // 1. #welcome
  await wipeChannel(chWelcome);
  const welcomeEmbed = new EmbedBuilder()
    .setColor(0xD4AF37) // Metallic Luxury Gold
    .setAuthor({ name: 'MOZZEX CAPITAL NETWORK', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('⚡ WELCOME TO MOZZEX CAPITAL')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> **Welcome to the next generation of managed on-chain wealth.**\n` +
      `> You fund a package, our verified trading desk executes high-conviction memecoin trades on your behalf, and profits are split **50/50** upon term completion.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '🚀 Quick Start (3 Simple Steps)',
        value:
          '**1️⃣ Read The Rules:** Check out <#' + chRules.id + '> to keep your wallet safe.\n' +
          '**2️⃣ Pick A Package:** View our tableized tiers in <#' + chPackages.id + '>.\n' +
          '**3️⃣ Open A Ticket:** Click **[ Start Investment ]** to lock in your duration & deposit.',
        inline: false
      },
      {
        name: '💎 Verified Payouts & Proof',
        value: 'Inspect real payout receipts and reviews in <#' + chPayouts.id + '>.',
        inline: false
      }
    )
    .setFooter({ text: 'Mozzex Capital • Transparent On-Chain Wealth', iconURL: 'attachment://mozzex-logo.png' })
    .setTimestamp();

  await chWelcome.send({ embeds: [welcomeEmbed], files: [createLogo()] });
  console.log('✅ Posted #welcome');

  // 2. #rules-and-safety
  await wipeChannel(chRules);
  const rulesEmbed = new EmbedBuilder()
    .setColor(0x00FFA3) // Cyber Emerald
    .setAuthor({ name: 'MOZZEX SAFETY PROTOCOL', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('🛡️ COMMUNITY RULES & SECURITY PROTOCOLS')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> To safeguard all investor funds and preserve a professional environment, please read our safety standards:\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '1️⃣  🚫 Strict Anti-Impersonation & NO DMs',
        value: 'Mozzex founders, traders, and bots will **NEVER** DM you first asking for wallet seed phrases, private keys, or personal transfers. All investments must be conducted inside official tickets in <#' + chSupport.id + '>.',
        inline: false
      },
      {
        name: '2️⃣  🛡️ Zero-Tolerance For Drainers & Honeypots',
        value: 'Posting malicious links, phishing sites, or unverified contract addresses results in an **immediate permanent ban** and bot blacklisting.',
        inline: false
      },
      {
        name: '3️⃣  📉 Transparency & Trading Risk',
        value: 'Memecoin markets carry market volatility. Mozzex operates with strict stop losses and risk mitigation. Trade durations are respected, and returns are settled at maturity.',
        inline: false
      },
      {
        name: '4️⃣  🤝 Respectful Degen Conduct',
        value: 'Keep the chat friendly and constructive in <#' + chGeneral.id + '>. Toxicity or malicious FUD will result in instant timeout.',
        inline: false
      }
    )
    .setFooter({ text: 'Mozzex Capital • Security First', iconURL: 'attachment://mozzex-logo.png' });

  await chRules.send({ embeds: [rulesEmbed], files: [createLogo()] });
  console.log('✅ Posted #rules-and-safety');

  // 3. #announcements
  await wipeChannel(chAnnouncements);
  const annEmbed = new EmbedBuilder()
    .setColor(0x00E5FF)
    .setAuthor({ name: 'MOZZEX CAPITAL DISPATCH', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('📢 OFFICIAL ANNOUNCEMENTS & POOL UPDATES')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> Official news, capital pool updates, trading performance reports, and major platform milestones will be posted here.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🔔 **Turn on channel notifications** to receive immediate alerts on new pool openings and payout cycles!`
    )
    .setFooter({ text: 'Mozzex Announcements', iconURL: 'attachment://mozzex-logo.png' })
    .setTimestamp();

  await chAnnouncements.send({ embeds: [annEmbed], files: [createLogo()] });
  console.log('✅ Posted #announcements');

  // 4. #investment-packages (THE MAIN CORE SHOWCASE!)
  await wipeChannel(chPackages);
  const packageEmbed = new EmbedBuilder()
    .setColor(0xD4AF37) // Luxury Gold
    .setAuthor({ name: 'MOZZEX MANAGED CAPITAL', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('💎 INVESTMENT PACKAGES & 50/50 PROFIT SYSTEM')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> **How It Works (Simple & Hands-Free):**\n` +
      `> 1. You choose a package and allocate your duration.\n` +
      `> 2. Our elite trading desk executes high-conviction memecoin snipes on your behalf.\n` +
      `> 3. Once the duration completes, **your full principal is returned + 50% of net profits**!\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '📦 INVESTMENT TIERS & DURATIONS',
        value:
          '```\n' +
          '┌──────────────┬──────────────┬──────────────┬──────────────┐\n' +
          '│ TIER         │ DEPOSIT      │ DURATION     │ PROFIT SPLIT │\n' +
          '├──────────────┼──────────────┼──────────────┼──────────────┤\n' +
          '│ 🥉 Starter   │ $10 - $25    │ 24 - 48 Hrs  │ 50% / 50%    │\n' +
          '│ 🥈 Growth    │ $30 - $75    │ 3 - 5 Days   │ 50% / 50%    │\n' +
          '│ 🥇 Pro       │ $100 - $250  │ 5 - 7 Days   │ 50% / 50%    │\n' +
          '│ 💎 Elite     │ $500 - $1K+  │ 7 - 14 Days  │ 50% / 50%    │\n' +
          '└──────────────┴──────────────┴──────────────┴──────────────┘\n' +
          '```',
        inline: false
      },
      {
        name: '💡 The 50% Profit Split — Real Example',
        value:
          `• You invest: **$100 USD**\n` +
          `• Mozzex trades and generates: **+$50 USD Profit**\n` +
          `• Mozzex Share (50%): **$25 USD**\n` +
          `• Your Profit Share (50%): **$25 USD**\n` +
          `• 💰 **Your Total Payout: $125 USD** ($100 Principal Returned + $25 Profit!)\n\n` +
          `*Your principal deposit is 100% returned to you alongside your profit payout.*`,
        inline: false
      },
      {
        name: '💳 Accepted Deposit & Payout Currencies',
        value: '• **Solana (SOL)**\n• **Litecoin (LTC)** *(Fastest & Low Fees)*\n• **USDT** *(TRC20 / BEP20)*\n• **Bitcoin (BTC)**',
        inline: false
      },
      {
        name: '🚀 How To Get Started Today',
        value: 'Click the **[ 🚀 Start Investment ]** button below to spawn a private, secure ticket. A managing partner will assist you with deposit instructions and log your duration contract.',
        inline: false
      }
    )
    .setFooter({ text: 'Mozzex Capital • Capital Managed With Precision', iconURL: 'attachment://mozzex-logo.png' })
    .setTimestamp();

  const pkgRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_invest_ticket')
      .setLabel('🚀 Start Investment / Open Ticket')
      .setStyle(ButtonStyle.Success)
      .setEmoji('💎'),
    new ButtonBuilder()
      .setCustomId('open_support_ticket')
      .setLabel('❓ Ask Questions')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('💬')
  );

  await chPackages.send({ embeds: [packageEmbed], components: [pkgRow], files: [createLogo()] });
  console.log('✅ Posted #investment-packages');

  // 5. #payouts-and-vouches
  await wipeChannel(chPayouts);
  const payoutEmbed = new EmbedBuilder()
    .setColor(0x00FFA3)
    .setAuthor({ name: 'MOZZEX PROOF & REPUTATION', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('📸 VERIFIED PAYOUTS & REVIEWS')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> **Proof is everything.** All client payouts, returned principals, and verified reviews are logged permanently here.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '⭐ How To Leave An Official Review',
        value:
          'Once your duration completes and you receive your payout, use:\n' +
          '```\n/vouch trader:@Mozzex rating:5 comment:Received $125 payout on $100 deposit in 48h! proof:<attach_wallet_screenshot>\n```',
        inline: false
      },
      {
        name: '🔒 Automated Payout Standard',
        value: 'All profits and capital are settled directly on-chain to your personal non-custodial wallet (Phantom, Solflare, Exodus, TrustWallet).',
        inline: false
      }
    )
    .setFooter({ text: 'Mozzex Capital • Transparent On-Chain Proof', iconURL: 'attachment://mozzex-logo.png' });

  await chPayouts.send({ embeds: [payoutEmbed], files: [createLogo()] });
  console.log('✅ Posted #payouts-and-vouches');

  // 6. #support-desk
  await wipeChannel(chSupport);
  const supportEmbed = new EmbedBuilder()
    .setColor(0xD4AF37)
    .setAuthor({ name: 'MOZZEX HELP DESK', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('🎫 OFFICIAL SUPPORT & INVESTMENT DESK')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `> Need assistance, want to deposit into an investment tier, or have questions about how our 50/50 profit model works?\n` +
      `> Click the button below to open a private encrypted ticket with Mozzex managing partners.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    )
    .addFields(
      {
        name: '⚡ Typical Inquiries',
        value:
          '• **New Deposits** — Setting up packages ($10, $30, $50, $100, $250, $500+).\n' +
          '• **Duration Check** — Inquiring about current trade progress.\n' +
          '• **Payout Claim** — Providing withdrawal wallet address upon completion.',
        inline: false
      }
    )
    .setFooter({ text: 'Private & Confidential • Average response under 15 minutes', iconURL: 'attachment://mozzex-logo.png' });

  const supportRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_invest_ticket')
      .setLabel('🚀 Deposit / Start Investment')
      .setStyle(ButtonStyle.Success)
      .setEmoji('💎'),
    new ButtonBuilder()
      .setCustomId('open_support_ticket')
      .setLabel('📩 General Support Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫')
  );

  await chSupport.send({ embeds: [supportEmbed], components: [supportRow], files: [createLogo()] });
  console.log('✅ Posted #support-desk');

  console.log(`\n🎉 SERVER RESTRUCTURED & SIMPLIFIED TO PERFECTION!`);
  process.exit(0);
});

client.login(config.token).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
