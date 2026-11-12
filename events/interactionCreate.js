const {
  handleTicketCreate,
  handleTicketClose,
  handleTicketClaim
} = require('../utils/ticketManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // 1. Button Interactions
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'buy_vip_ticket') {
        return handleTicketCreate(interaction, 'vip');
      }
      if (customId === 'open_invest_ticket') {
        return handleTicketCreate(interaction, 'investment');
      }
      if (customId === 'open_support_ticket') {
        return handleTicketCreate(interaction, 'support');
      }
      if (customId === 'open_client_ticket') {
        return handleTicketCreate(interaction, 'client');
      }
      if (customId === 'open_mentorship_ticket') {
        return handleTicketCreate(interaction, 'vip');
      }
      if (customId === 'close_ticket') {
        return handleTicketClose(interaction);
      }
      if (customId === 'claim_ticket') {
        return handleTicketClaim(interaction);
      }
    }

    // 2. Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const replyPayload = {
          content: '❌ An error occurred while executing this command!',
          ephemeral: true
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyPayload);
        } else {
          await interaction.reply(replyPayload);
        }
      }
    }
  }
};
