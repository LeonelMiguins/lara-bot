const { getParticipantId, isSameWhatsAppId, normalizeUserId } = require('../utils/wweb');

function isAdminParticipant(participant) {
  return Boolean(participant?.isAdmin || participant?.isSuperAdmin);
}

function findParticipantById(participants, targetId) {
  const normalizedTargetId = normalizeUserId(targetId);
  if (!normalizedTargetId || !Array.isArray(participants)) {
    return null;
  }

  return (
    participants.find((participant) =>
      isSameWhatsAppId(getParticipantId(participant), normalizedTargetId),
    ) || null
  );
}

async function resolveUserAliases(client, userId) {
  const aliases = new Set();
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId) {
    return aliases;
  }

  aliases.add(normalizedUserId);

  if (!client?.getContactLidAndPhone) {
    return aliases;
  }

  try {
    const [result] = await client.getContactLidAndPhone([normalizedUserId]);
    const lid = normalizeUserId(result?.lid);
    const pn = normalizeUserId(result?.pn);

    if (lid) {
      aliases.add(lid);
    }

    if (pn) {
      aliases.add(pn);
    }
  } catch {}

  return aliases;
}

async function resolveParticipant(client, participants, targetId) {
  const aliases = await resolveUserAliases(client, targetId);

  for (const alias of aliases) {
    const participant = findParticipantById(participants, alias);
    if (participant) {
      return participant;
    }
  }

  return findParticipantById(participants, targetId);
}

async function resolveParticipantId(client, participants, targetId) {
  const participant = await resolveParticipant(client, participants, targetId);
  return participant ? getParticipantId(participant) : '';
}

module.exports = {
  findParticipantById,
  isAdminParticipant,
  resolveParticipant,
  resolveParticipantId,
  resolveUserAliases,
};
