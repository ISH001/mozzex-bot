const { handleInviteDelete } = require('../utils/inviteTracker');

module.exports = {
  name: 'inviteDelete',
  async execute(invite) {
    handleInviteDelete(invite);
  }
};
