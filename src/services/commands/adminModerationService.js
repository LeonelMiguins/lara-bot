const ownerNotifications = require('../ownerNotificationService');
const { resolveParticipant } = require('../whatsappIdentityService');
const { getParticipantId, normalizeChatId, toContactId } = require('../../utils/wweb');

function extractTargetFromText(text) {
  const match = String(text || '').match(/@?(\d{10,16})/);
  return match ? toContactId(match[1]) : '';
}

function resolveTargetId({ body, mentions = [], quotedMessage = {} }) {
  return normalizeChatId(
    mentions[0] || quotedMessage?.author || quotedMessage?.from || extractTargetFromText(body),
  );
}

async function promoteParticipant({
  client,
  chat,
  chatId,
  body,
  mentions,
  quotedMessage,
  participants,
  chatName,
}) {
  const target = resolveTargetId({ body, mentions, quotedMessage });
  if (!target) {
    return { status: 'missing_target' };
  }

  const participant = await resolveParticipant(client, participants, target);
  if (!participant) {
    return { status: 'participant_not_found' };
  }

  if (participant.isAdmin || participant.isSuperAdmin) {
    return { status: 'already_admin' };
  }

  const participantId = getParticipantId(participant);
  await chat.promoteParticipants([participantId]);
  await ownerNotifications.notifyModerationEvent(client, 'Promocao de administrador', [
    `Grupo: ${chatName || chat.name || chatId}`,
    `Membro: ${participantId}`,
    'Acao: promovido a administrador',
  ]);

  return {
    status: 'promoted',
    participantId,
  };
}

async function removeParticipant({
  client,
  chat,
  chatId,
  body,
  mentions,
  quotedMessage,
  participants,
  chatName,
}) {
  const target = resolveTargetId({ body, mentions, quotedMessage });
  if (!target) {
    return { status: 'missing_target' };
  }

  const participant = await resolveParticipant(client, participants, target);
  if (!participant) {
    return { status: 'participant_not_found' };
  }

  if (participant.isAdmin || participant.isSuperAdmin) {
    return { status: 'cannot_remove_admin' };
  }

  const participantId = getParticipantId(participant);
  await chat.removeParticipants([participantId]);
  await ownerNotifications.notifyModerationEvent(client, 'Remocao de membro', [
    `Grupo: ${chatName || chat.name || chatId}`,
    `Membro: ${participantId}`,
    'Acao: removido do grupo',
  ]);

  return {
    status: 'removed',
    participantId,
  };
}

module.exports = {
  promoteParticipant,
  removeParticipant,
};
