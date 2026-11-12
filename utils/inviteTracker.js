const db = require('../database/db');

// Map of guildId -> Map of inviteCode -> uses
const guildInvitesCache = new Map();

async function initInviteCache(client) {
  console.log('[Invites] Initializing guild invite cache...');
  for (const [guildId, guild] of client.guilds.cache) {
    try {
      const invites = await guild.invites.fetch();
      const codeUses = new Map();
      invites.forEach(inv => codeUses.set(inv.code, inv.uses));
      guildInvitesCache.set(guildId, codeUses);
      console.log(`[Invites] Cached ${invites.size} invites for guild: ${guild.name}`);
    } catch (err) {
      console.warn(`[Invites] Could not fetch invites for guild ${guild.name}:`, err.message);
    }
  }
}

async function handleMemberJoin(member) {
  const guild = member.guild;
  const cached = guildInvitesCache.get(guild.id) || new Map();
  let usedInvite = null;

  try {
    const currentInvites = await guild.invites.fetch();
    for (const [code, inv] of currentInvites) {
      const prevUses = cached.get(code) || 0;
      if (inv.uses > prevUses) {
        usedInvite = inv;
        cached.set(code, inv.uses);
        break;
      }
    }
    // Update whole cache with fresh data
    const freshMap = new Map();
    currentInvites.forEach(inv => freshMap.set(inv.code, inv.uses));
    guildInvitesCache.set(guild.id, freshMap);
  } catch (err) {
    console.error('[Invites] Error finding used invite:', err);
  }

  const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
  const isFake = accountAgeDays < 3; // accounts younger than 3 days marked as suspicious/fake

  const inviterId = usedInvite && usedInvite.inviter ? usedInvite.inviter.id : null;
  const inviteCode = usedInvite ? usedInvite.code : 'unknown';

  db.recordJoin(member.id, inviterId, inviteCode, isFake);

  return {
    inviter: usedInvite ? usedInvite.inviter : null,
    code: inviteCode,
    isFake,
    invites: inviterId ? db.getInvites(inviterId) : null
  };
}

function handleInviteCreate(invite) {
  const cached = guildInvitesCache.get(invite.guild.id);
  if (cached) {
    cached.set(invite.code, invite.uses);
  }
}

function handleInviteDelete(invite) {
  const cached = guildInvitesCache.get(invite.guild.id);
  if (cached) {
    cached.delete(invite.code);
  }
}

module.exports = {
  initInviteCache,
  handleMemberJoin,
  handleInviteCreate,
  handleInviteDelete
};
