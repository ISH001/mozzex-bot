const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('../config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
  console.log(`Updating #support-desk as ${client.user.tag}...`);
  const guild = client.guilds.cache.get(config.guildId) || client.guilds.cache.first();
  if (!guild) {
    console.error('Guild not found');
    process.exit(1);
  }

  const supportChannel = guild.channels.cache.find(c => c.name.includes('support-desk'));
  if (!supportChannel) {
    console.error('#support-desk channel not found');
    process.exit(1);
  }

  // Purge old messages
  try {
    const msgs = await supportChannel.messages.fetch({ limit: 10 });
    await supportChannel.bulkDelete(msgs).catch(() => {});
  } catch (e) {}

  const logoPath = path.join(__dirname, '../assets/MOZZEX Trading Community Icon.png');
  const logo = new AttachmentBuilder(logoPath, { name: 'mozzex-logo.png' });

  const embed = new EmbedBuilder()
    .setColor(0xC0C0C0) // Luxury Platinum Silver
    .setAuthor({ name: 'MOZZEX CAPITAL • OFFICIAL DESK', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('🏛️ OFFICIAL INVESTMENT & SUPPORT DESK')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `Welcome to the **Mozzex Capital Client & Support Desk**.\n\n` +
      `Our managing desk is run directly by founders **Claxy** & **Mozzari**. Whether you are funding an investment allocation, purchasing our proprietary trading e-books, or have account inquiries, select the appropriate option below to open a private ticket.\n\n` +
      `────────────────────────────────────────`
    )
    .addFields(
      {
        name: '🚀 1. Managed Investment Allocation',
        value: '• Hands-free capital pool ($10 to $1,000+)\n• Choose your duration (24h to 7d)\n• 100% principal back + 50% profit split\n• Dedicated personal live **FOMO tracking link**',
        inline: false
      },
      {
        name: '📚 2. Mozzex E-Books & Knowledge Library',
        value: '• **Volume 1:** The Degen Starter Blueprint ($20)\n• **Volume 2:** The Anti-Scam & Rug Bible ($20)\n• **Volume 3:** Mastering FOMO & Copy Trading ($20)\n• **Complete 3-Book Trilogy Bundle:** **$35 USD**\n• Instant high-res PDF and Notion links delivered in your ticket.',
        inline: false
      },
      {
        name: '👑 3. Lifetime VIP Membership ($50 USD)',
        value: '• **ALL 3 BOOKS INCLUDED FREE**\n• High-speed trading tools (Photon/BullX/Axiom presets)\n• 1-on-1 personal setup walkthrough with founders\n• Real-time VIP Alpha Calls channel access',
        inline: false
      },
      {
        name: '💳 Accepted Payment Methods',
        value: '• **Crypto (0% Fee):** SOL, LTC, USDT, BTC\n• **Fiat (+10% Fee):** PayPal, Credit/Debit Cards, Apple Pay',
        inline: false
      }
    )
    .setFooter({
      text: 'Mozzex Capital • Click a button below to open your private ticket',
      iconURL: 'attachment://mozzex-logo.png'
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('open_invest_ticket')
      .setLabel('🚀 Deposit / Start Investment')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('buy_books_ticket')
      .setLabel('📚 Buy E-Books ($20 / $35)')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('buy_vip_ticket')
      .setLabel('👑 Buy Lifetime VIP ($50)')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('open_support_ticket')
      .setLabel('📩 General Support')
      .setStyle(ButtonStyle.Secondary)
  );

  await supportChannel.send({ embeds: [embed], components: [row], files: [logo] });
  console.log('✅ Updated #support-desk successfully!');
  process.exit(0);
});

client.login(config.token);
