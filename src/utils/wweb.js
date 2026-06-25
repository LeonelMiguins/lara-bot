const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

function normalizeChatId(id) {
  return String(id || '').trim();
}

function normalizeUserId(id) {
  return normalizeChatId(id)
    .replace(/:\d+(?=@)/g, '')
    .toLowerCase();
}

function toContactId(input) {
  const cleaned = String(input || '')
    .replace(/\s+/g, '')
    .replace(/^\+/, '')
    .replace(/@.+$/, '')
    .replace(/\D/g, '');

  return cleaned ? `${cleaned}@c.us` : '';
}

function toGroupId(input) {
  const value = normalizeChatId(input);
  return value.endsWith('@g.us') ? value : '';
}

function isGroupId(id) {
  return normalizeChatId(id).endsWith('@g.us');
}

function idToHandle(id) {
  return String(id || '').split('@')[0] || 'usuario';
}

function getParticipantId(participant) {
  return normalizeUserId(
    participant?.id?._serialized ||
      participant?.id?.user && `${participant.id.user}@${participant.id.server || 'c.us'}` ||
      participant?.id?.lid?._serialized ||
      participant?.id?.pn?._serialized ||
      participant?.lid?._serialized ||
      participant?.pn?._serialized ||
      participant?.contact?.id?._serialized ||
      participant?.serialized ||
      '',
  );
}

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

function isSameWhatsAppId(left, right) {
  const normalizedLeft = normalizeUserId(left);
  const normalizedRight = normalizeUserId(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  if (normalizedLeft === normalizedRight) {
    return true;
  }

  return idToHandle(normalizedLeft) === idToHandle(normalizedRight);
}

async function getChatMetadata(message) {
  const chat = await message.getChat();
  const contact = await chat.getContact();

  return {
    chat,
    chatId: chat.id._serialized,
    chatName: chat.name || contact.pushname || contact.name || idToHandle(chat.id._serialized),
    isGroup: chat.isGroup,
    contact,
  };
}

async function getSenderId(message) {
  if (message.fromMe) {
    return normalizeChatId(message.to);
  }

  return normalizeChatId(message.author || message.from);
}

async function getMentionedIds(message) {
  const contacts = await message.getMentions();
  return contacts.map((contact) => contact.id._serialized);
}

async function getQuotedMessage(message) {
  if (!message.hasQuotedMsg) {
    return null;
  }

  try {
    return await message.getQuotedMessage();
  } catch {
    return null;
  }
}

function mediaFromBase64(media) {
  if (!media?.data || !media?.mimetype) {
    return null;
  }

  const extension = media.filename?.split('.').pop() || media.mimetype.split('/').pop() || 'bin';
  return new MessageMedia(media.mimetype, media.data, `media.${extension}`);
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(path.resolve(dirPath), { recursive: true });
}

module.exports = {
  ensureDirectory,
  getChatMetadata,
  getMentionedIds,
  findParticipantById,
  getQuotedMessage,
  getSenderId,
  idToHandle,
  isAdminParticipant,
  isSameWhatsAppId,
  isGroupId,
  mediaFromBase64,
  normalizeChatId,
  normalizeUserId,
  resolveParticipant,
  resolveParticipantId,
  resolveUserAliases,
  toContactId,
  toGroupId,
  getParticipantId,
};
