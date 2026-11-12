const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const db = require('../database/db');
const config = require('../config');

async function handleTicketCreate(interaction, type = 'general') {
  const guild = interaction.guild;
  const user = interaction.user;

  // Check if user already has an active ticket channel open
  const existingChannel = guild.channels.cache.find(c =>
    c.name.startsWith('ticket-') && c.topic && c.topic.includes(user.id)
  );

  if (existingChannel) {
    return interaction.reply({
      content: `❌ You already have an open ticket in <#${existingChannel.id}>! Please use that channel or close it first.`,
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  // Find or create "🎫 TICKETS" category
  let category = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket')
  );

  if (!category) {
    try {
      category = await guild.channels.create({
        name: '🎫 TICKETS',
        type: ChannelType.GuildCategory
      });
    } catch (e) {
      console.warn('Could not create ticket category:', e);
    }
  }

  // Find Staff role if present
  const staffRole = guild.roles.cache.find(
    r => r.name.toLowerCase() === config.roles.staff.toLowerCase() || r.name.toLowerCase().includes('mod') || r.name.toLowerCase().includes('staff')
  );

  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory
      ]
    },
    {
      id: guild.client.user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles
      ]
    }
  ];

  if (staffRole) {
    permissionOverwrites.push({
      id: staffRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory
      ]
    });
  }

  const cleanName = user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'user';
  const channelName = `ticket-${cleanName}`;

  try {
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category ? category.id : null,
      topic: `Mozzex Ticket for ${user.tag} (ID: ${user.id}) | Type: ${type}`,
      permissionOverwrites
    });

    const ticketData = db.createTicket(ticketChannel.id, user.id, type);

    const typeTitle = type === 'vip' ? '👑 Mozzex Lifetime VIP Onboarding ($50 USD)'
      : type === 'investment' ? '💰 Mozzex Capital Investment Ticket'
      : type === 'mentorship' ? '💎 Mentorship & Capital Application'
      : type === 'client' ? '💼 Client Capital Priority Ticket'
      : '🎫 Support Ticket';

    let instructions = `Welcome <@${user.id}>! A member of the **Mozzex Team** will be with you shortly.\n\n`;
    if (type === 'vip') {
      instructions += `**👑 You have requested the Lifetime VIP Membership ($50 USD):**\n\n` +
        `• **What You Get:** Lifetime VIP Role, all 3 Mozzex Knowledge Books, curated trading tools configuration, step-by-step 1-on-1 tool setup, and VIP alpha calls.\n` +
        `• **Price:** **$50 USD** (One-time, no subscriptions)\n` +
        `• **Payment Accepted:** SOL, LTC, USDT, or BTC\n\n` +
        `*Please reply with your preferred payment currency (e.g. LTC or SOL) and our staff will provide your secure deposit address.*`;
    } else if (type === 'investment') {
      instructions += `**Please provide your investment details below:**\n` +
        `• **Chosen Package:** ($10 / $30 / $50 / $100 / $250 / $500+)\n` +
        `• **Duration Term:** (24-48 Hours / 3-5 Days / 7 Days)\n` +
        `• **Deposit Method:** (SOL / LTC / USDT / BTC)\n` +
        `• **Your Payout Wallet:** (Address where principal + 50% profit returns)\n\n` +
        `*Our managing partner will generate your private deposit address and set up your personal FOMO profile.*`;
    } else {
      instructions += `**Please describe your inquiry with as much detail as possible:**\n` +
        `• If general support: State your question clearly.\n` +
        `• If reporting an issue: Provide relevant transaction or member IDs.`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xD4AF37) // Metallic Gold
      .setTitle(`${typeTitle} #${ticketData.ticketNumber}`)
      .setDescription(instructions)
      .addFields(
        { name: '👤 Member', value: `<@${user.id}>`, inline: true },
        { name: '📂 Type', value: `\`${type.toUpperCase()}\``, inline: true },
        { name: '⏰ Opened', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: 'Mozzex Ticket System • Click Close when resolved.' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('🔒 Close Ticket')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('🙋 Claim Ticket')
        .setStyle(ButtonStyle.Secondary)
    );

    await ticketChannel.send({
      content: `<@${user.id}> ${staffRole ? `<@&${staffRole.id}>` : ''}`,
      embeds: [embed],
      components: [row]
    });

    await interaction.editReply({
      content: `✅ Your ticket has been created: <#${ticketChannel.id}>`,
      ephemeral: true
    });
  } catch (err) {
    console.error('Failed to create ticket channel:', err);
    await interaction.editReply({
      content: `❌ Error creating ticket: ${err.message}`,
      ephemeral: true
    });
  }
}

async function handleTicketClose(interaction) {
  const channel = interaction.channel;
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: '❌ This command can only be used in ticket channels.', ephemeral: true });
  }

  await interaction.reply({
    content: '🔒 Ticket closing in 5 seconds...',
    ephemeral: false
  });

  db.closeTicket(channel.id);

  setTimeout(async () => {
    try {
      await channel.delete('Ticket resolved by user/staff');
    } catch (err) {
      console.error('Failed to delete ticket channel:', err);
    }
  }, 5000);
}

async function handleTicketClaim(interaction) {
  const channel = interaction.channel;
  if (!channel.name.startsWith('ticket-')) {
    return interaction.reply({ content: '❌ This command can only be used in ticket channels.', ephemeral: true });
  }

  const staff = interaction.user;
  const embed = new EmbedBuilder()
    .setColor(config.colors.accent)
    .setDescription(`🙋 **Ticket Claimed**: <@${staff.id}> is now handling this inquiry.`);

  await interaction.reply({ embeds: [embed] });
}

module.exports = {
  handleTicketCreate,
  handleTicketClose,
  handleTicketClaim
};
