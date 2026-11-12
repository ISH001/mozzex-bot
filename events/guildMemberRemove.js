const db = require('../database/db');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    console.log(`[Leave] Member left: ${member.user.tag}`);
    db.recordLeave(member.id);
  }
};
