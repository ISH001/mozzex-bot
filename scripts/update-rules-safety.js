const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');
const config = require('../config');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', async () => {
  console.log(`Updating #rules-and-safety as ${client.user.tag}...`);
  const guild = client.guilds.cache.get(config.guildId) || client.guilds.cache.first();
  if (!guild) {
    console.error('Guild not found');
    process.exit(1);
  }

  const rulesChannel = guild.channels.cache.find(c => c.name.includes('rules-and-safety'));
  if (!rulesChannel) {
    console.error('#rules-and-safety channel not found');
    process.exit(1);
  }

  // Purge old messages
  try {
    const msgs = await rulesChannel.messages.fetch({ limit: 10 });
    await rulesChannel.bulkDelete(msgs).catch(() => {});
  } catch (e) {}

  const logoPath = path.join(__dirname, '../assets/server-logo.png');
  const logo = new AttachmentBuilder(logoPath, { name: 'mozzex-logo.png' });

  const embed = new EmbedBuilder()
    .setColor(0xC0C0C0) // Platinum Silver
    .setAuthor({ name: 'MOZZEX CAPITAL • SECURITY & TRADING CHARTER', iconURL: 'attachment://mozzex-logo.png' })
    .setTitle('📜 RULES, CAPITAL PROTECTION & SAFETY CHARTER')
    .setThumbnail('attachment://mozzex-logo.png')
    .setDescription(
      `Welcome to **Mozzex Capital**. By participating in our community, allocating capital, or purchasing digital guides, you agree to our transparent risk and safety guidelines.\n\n` +
      `────────────────────────────────────────`
    )
    .addFields(
      {
        name: '⚠️ 1. No Profit Guarantees (Honest Trading Truth)',
        value: 'Anyone promising "guaranteed returns" in crypto is scamming. Cryptocurrency and memecoin markets are volatile and high-risk. We do NOT guarantee profits; we guarantee **ruthless algorithmic risk mitigation, 24/7 on-chain monitoring, and 100% transparency** on FOMO.',
        inline: false
      },
      {
        name: '🛡️ 2. The 30% Hard Stop-Loss Guardrail',
        value: 'When trading on your own, emotion and lack of tracking cause 99% of people to lose their entire portfolio (-100%). At Mozzex Capital, we operate with cold discipline: **we cut losses at a maximum 30% drawdown**. Even in worst-case conditions, at least **70% of your principal is protected and returned**.',
        inline: false
      },
      {
        name: '💰 3. Client Cashout Choice in Profit',
        value: 'When our desk trades enter profit (+25%, +50%, +100%+), **you decide**: cash out immediately to lock in your payout (100% principal + 50% profit split), or instruct the desk to let the position ride for bigger multipliers.',
        inline: false
      },
      {
        name: '⚖️ 4. Mandatory Ticket Dispute Resolution & Anti-Chargeback Policy',
        value: 'All inquiries, issues, or disputes must be handled directly with founders **Claxy & Mozzari** via `#🎫・support-desk` tickets. All blockchain transactions are final. Filing fraudulent fiat chargebacks will result in permanent blacklisting and submission to fraud prevention networks.',
        inline: false
      },
      {
        name: '🔒 5. Official Desk Security',
        value: 'Staff will **NEVER** DM you first offering "special deals" or asking for seed phrases. All official transactions occur strictly inside private Discord ticket channels.',
        inline: false
      }
    )
    .setFooter({
      text: 'Mozzex Capital • Capital Defense First • Founded by Claxy & Mozzari',
      iconURL: 'attachment://mozzex-logo.png'
    })
    .setTimestamp();

  await rulesChannel.send({ embeds: [embed], files: [logo] });
  console.log('✅ Updated #rules-and-safety successfully!');
  process.exit(0);
});

client.login(config.token);
