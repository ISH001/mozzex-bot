const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',

  roles: {
    member: process.env.MEMBER_ROLE_NAME || 'Member',
    premium: process.env.PREMIUM_ROLE_NAME || 'Premium Member',
    staff: process.env.STAFF_ROLE_NAME || 'Staff',
  },

  channels: {
    welcome: process.env.WELCOME_CHANNEL || 'introductions',
    rules: process.env.RULES_CHANNEL || 'server-rules',
    announcements: process.env.ANNOUNCEMENTS_CHANNEL || 'announcements',
    mentorship: process.env.MENTORSHIP_CHANNEL || 'trading-mentorship',
    support: process.env.SUPPORT_CHANNEL || 'support-desk',
    importantInfo: process.env.IMPORTANT_INFO_CHANNEL || 'important-info',
    vouches: process.env.VOUCHES_CHANNEL || 'vouches',
    clientSupport: process.env.CLIENT_SUPPORT_CHANNEL || 'client-support',
    modLogs: process.env.MOD_LOGS_CHANNEL || 'mod-logs',
  },

  colors: {
    primary: parseInt((process.env.THEME_COLOR || '#00FFA3').replace('#', ''), 16),
    accent: parseInt((process.env.ACCENT_COLOR || '#00E5FF').replace('#', ''), 16),
    danger: parseInt((process.env.WARN_COLOR || '#FF3B30').replace('#', ''), 16),
    gold: parseInt((process.env.GOLD_COLOR || '#FFD700').replace('#', ''), 16),
  }
};
