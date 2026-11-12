const { handleInviteCreate } = require('../utils/inviteTracker');

module.exports = {
  name: 'inviteCreate',
  async execute(invite) {
    handleInviteCreate(invite);
  }
};
