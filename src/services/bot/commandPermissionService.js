const { getParticipantId, } = require('../../utils/wweb');
const { isAdminParticipant } = require('../whatsappIdentityService');

function validateCommandPermission(command, context) {
  if (command.ownerOnly && !context.senderIsOwner) {
    return {
      allowed: false,
      reason: 'owner_only',
    };
  }

  if (command.groupOnly && !context.isGroup) {
    return {
      allowed: false,
      reason: 'group_only',
    };
  }

  if (command.adminOnly && !context.senderIsAdmin && !context.ownerIsOperator) {
    return {
      allowed: false,
      reason: 'admin_only',
      meta: {
        participants: context.participants
          .map((participant) => `${getParticipantId(participant)}:${isAdminParticipant(participant) ? 'admin' : 'membro'}`),
      },
    };
  }

  return { allowed: true };
}

module.exports = {
  validateCommandPermission,
};
