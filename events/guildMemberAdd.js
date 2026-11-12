const { EmbedBuilder } = require('discord.js');
const { handleMemberJoin } = require('../utils/inviteTracker');
const config = require('../config');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guild = member.guild;
    console.log(`[Join] Member joined: ${member.user.tag} in ${guild.name}`);

    // Track invite
    let inviteInfo = null;
    try {
      inviteInfo = await handleMemberJoin(member);
    } catch (e) {
      console.error('[Join] Invite tracking error:', e);
    }

    // Auto-role assignment
    try {
      const defaultRole = guild.roles.cache.find(
        r => r.name.toLowerCase() === config.roles.member.toLowerCase() || r.name.toLowerCase() === 'trader'
      );
      if (defaultRole) {
        await member.roles.add(defaultRole);
        console.log(`[Auto-Role] Added ${defaultRole.name} to ${member.user.tag}`);
      }
    } catch (e) {
      console.warn(`[Auto-Role] Could not auto-assign role:`, e.message);
    }

    // Find welcome channel (look for configured name or 'introductions' or 'welcome')
    const welcomeChannel = guild.channels.cache.find(
      c => c.name.toLowerCase().includes(config.channels.welcome.toLowerCase()) ||
           c.name.toLowerCase().includes('welcome') ||
           c.name.toLowerCase().includes('introduction')
    );

    if (!welcomeChannel) return;

    let inviterText = 'Joined directly / Vanity link';
    if (inviteInfo && inviteInfo.inviter) {
      const invCount = inviteInfo.invites ? inviteInfo.invites.net : 1;
      inviterText = `Invited by <@${inviteInfo.inviter.id}> (**${invCount}** invites)`;
      if (inviteInfo.isFake) {
        inviterText += ' *(⚠️ New account)*';
      }
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`⚡ WELCOME TO MOZZEX, ${member.user.username.toUpperCase()}!`)
      .setDescription(
        `Welcome to the **Mozzex Trading Community** — home of alpha calls, high-speed memecoin scanners, and disciplined trading.\n\n` +
        `• **Member**: <@${member.id}>\n` +
        `• **Source**: ${inviterText}\n` +
        `• **Total Degens**: **#${guild.memberCount}**\n\n` +
        `🔥 **Get Started:**\n` +
        `1. Read the rules in <#${guild.channels.cache.find(c => c.name.includes('rules'))?.id || 'rules'}>\n` +
        `2. Introduce yourself and what tokens you trade right here!\n` +
        `3. Start scanning tokens with \`/scan <contract_address>\``
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setImage('https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80')
      .setFooter({ text: 'Mozzex Network • Trade with discipline', iconURL: guild.iconURL() || member.user.displayAvatarURL() })
      .setTimestamp();

    try {
      await welcomeChannel.send({
        content: `👋 Hey <@${member.id}>, welcome to **MOZZEX**!`,
        embeds: [embed]
      });
    } catch (err) {
      console.error('[Welcome] Could not send welcome message:', err);
    }
  }
};
