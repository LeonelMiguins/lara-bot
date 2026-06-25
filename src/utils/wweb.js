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
  getQuotedMessage,
  getSenderId,
  idToHandle,
  isSameWhatsAppId,
  isGroupId,
  mediaFromBase64,
  normalizeChatId,
  normalizeUserId,
  toContactId,
  toGroupId,
  getParticipantId,
};
