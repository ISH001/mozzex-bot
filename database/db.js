const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'mozzex_data.json');

const defaultData = {
  invites: {},        // inviterId: { regular: 0, left: 0, fake: 0, bonus: 0 }
  joinedMembers: {},  // memberId: { inviterId: '', code: '', joinedAt: 0 }
  tickets: {},        // channelId: { userId: '', type: '', createdAt: 0, status: 'open' }
  vouches: [],        // [ { id, userId, authorId, rating, comment, proof, createdAt } ]
  settings: {
    ticketCounter: 0,
    welcomeEnabled: true,
    autoRoleEnabled: true
  }
};

let cache = null;

function loadDb() {
  if (cache) return cache;
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      cache = Object.assign({}, defaultData, JSON.parse(raw));
    } else {
      cache = JSON.parse(JSON.stringify(defaultData));
      saveDb();
    }
  } catch (err) {
    console.error('[DB] Failed to load db, using defaults:', err);
    cache = JSON.parse(JSON.stringify(defaultData));
  }
  return cache;
}

function saveDb() {
  if (!cache) return;
  try {
    const tempPath = `${dbFilePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(cache, null, 2), 'utf8');
    fs.renameSync(tempPath, dbFilePath);
  } catch (err) {
    console.error('[DB] Error saving db:', err);
  }
}

// Invite Management
function recordJoin(memberId, inviterId, code, isFake = false) {
  const db = loadDb();
  db.joinedMembers[memberId] = {
    inviterId: inviterId || 'vanity_or_unknown',
    code: code || 'unknown',
    joinedAt: Date.now()
  };

  if (inviterId && inviterId !== 'vanity_or_unknown') {
    if (!db.invites[inviterId]) {
      db.invites[inviterId] = { regular: 0, left: 0, fake: 0, bonus: 0 };
    }
    if (isFake) {
      db.invites[inviterId].fake += 1;
    } else {
      db.invites[inviterId].regular += 1;
    }
  }
  saveDb();
}

function recordLeave(memberId) {
  const db = loadDb();
  const joinInfo = db.joinedMembers[memberId];
  if (!joinInfo) return null;

  const inviterId = joinInfo.inviterId;
  if (inviterId && db.invites[inviterId]) {
    db.invites[inviterId].left += 1;
    saveDb();
  }
  return joinInfo;
}

function getInvites(userId) {
  const db = loadDb();
  const userStats = db.invites[userId] || { regular: 0, left: 0, fake: 0, bonus: 0 };
  const total = (userStats.regular + userStats.bonus) - (userStats.left + userStats.fake);
  return {
    ...userStats,
    net: Math.max(0, total)
  };
}

function getTopInviters(limit = 10) {
  const db = loadDb();
  const list = Object.entries(db.invites).map(([userId, stats]) => {
    const net = Math.max(0, (stats.regular + stats.bonus) - (stats.left + stats.fake));
    return { userId, ...stats, net };
  });
  list.sort((a, b) => b.net - a.net);
  return list.slice(0, limit);
}

// Ticket Management
function createTicket(channelId, userId, type = 'general') {
  const db = loadDb();
  db.settings.ticketCounter = (db.settings.ticketCounter || 0) + 1;
  db.tickets[channelId] = {
    ticketNumber: db.settings.ticketCounter,
    userId,
    type,
    createdAt: Date.now(),
    status: 'open'
  };
  saveDb();
  return db.tickets[channelId];
}

function getTicket(channelId) {
  const db = loadDb();
  return db.tickets[channelId] || null;
}

function closeTicket(channelId) {
  const db = loadDb();
  if (db.tickets[channelId]) {
    db.tickets[channelId].status = 'closed';
    db.tickets[channelId].closedAt = Date.now();
    saveDb();
    return db.tickets[channelId];
  }
  return null;
}

// Vouch Management
function addVouch(targetUserId, authorId, rating, comment, proofUrl = null) {
  const db = loadDb();
  const vouch = {
    id: db.vouches.length + 1,
    targetUserId,
    authorId,
    rating: Number(rating),
    comment: comment || '',
    proofUrl: proofUrl || '',
    createdAt: Date.now()
  };
  db.vouches.push(vouch);
  saveDb();
  return vouch;
}

function getVouchesFor(targetUserId) {
  const db = loadDb();
  return db.vouches.filter(v => v.targetUserId === targetUserId);
}

module.exports = {
  loadDb,
  recordJoin,
  recordLeave,
  getInvites,
  getTopInviters,
  createTicket,
  getTicket,
  closeTicket,
  addVouch,
  getVouchesFor
};
