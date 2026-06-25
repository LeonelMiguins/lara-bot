const config = require('../config/config');
const { loadOwnerSettings } = require('./ownerSettingsService');
const { info, moderation } = require('../utils/respond');
const { normalizeChatId, normalizeUserId, toContactId } = require('../utils/wweb');

function ownerContactId() {
  return normalizeUserId(toContactId(config.owner?.phone || ''));
}

function isOwnerUser(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const ownerId = ownerContactId();

  if (!normalizedUserId || !ownerId) {
    return false;
  }

  if (normalizedUserId === ownerId) {
    return true;
  }

  return normalizedUserId.split('@')[0] === ownerId.split('@')[0];
}

async function sendOwnerMessage(client, text) {
  const target = ownerContactId();
  if (!target) {
    return false;
  }

  await client.sendMessage(target, text);
  return true;
}

function notificationsEnabled() {
  return Boolean(loadOwnerSettings().notifications?.enabled);
}

function commandEventsEnabled() {
  const settings = loadOwnerSettings();
  return Boolean(settings.notifications?.enabled && settings.notifications?.commandEvents);
}

function moderationEventsEnabled() {
  const settings = loadOwnerSettings();
  return Boolean(settings.notifications?.enabled && settings.notifications?.moderationEvents);
}

async function notifyCommandExecuted(client, commandName, context, durationMs) {
  if (!commandEventsEnabled()) {
    return false;
  }

  if (isOwnerUser(context?.senderId)) {
    return false;
  }

  return sendOwnerMessage(
    client,
    info(
      'Comando executado',
      [
        `Comando: ${commandName}`,
        `Grupo: ${context?.chatName || context?.chatId || 'desconhecido'}`,
        `Chat ID: ${context?.chatId || 'desconhecido'}`,
        `Remetente: ${context?.senderId || 'desconhecido'}`,
        `Duracao: ${durationMs}ms`,
      ].join('\n'),
    ),
  );
}

async function notifyModerationEvent(client, title, lines = []) {
  if (!moderationEventsEnabled()) {
    return false;
  }

  return sendOwnerMessage(client, moderation(title, lines.join('\n')));
}

module.exports = {
  isOwnerUser,
  notifyCommandExecuted,
  notifyModerationEvent,
  ownerContactId,
  sendOwnerMessage,
};
