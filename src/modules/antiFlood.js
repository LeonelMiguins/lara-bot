const config = require('../config/config');
const logger = require('../services/loggerService');
const ownerNotifications = require('../services/ownerNotificationService');
const { resolveParticipantId } = require('../services/whatsappIdentityService');
const { moderation } = require('../utils/respond');
const { idToHandle } = require('../utils/wweb');

function normalizeMessageText(text) {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

module.exports = function setupAntiFlood(client) {
  const tracker = new Map();
  const cleanupIntervalMs = config.antiFlood?.cleanupIntervalMs ?? 60000;
  const fallbackWindowMs = config.antiFlood?.windowMs ?? 15000;

  function pruneExpiredEntries() {
    const now = Date.now();

    for (const [key, entry] of tracker.entries()) {
      entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp <= fallbackWindowMs);

      if (!entry.timestamps.length) {
        tracker.delete(key);
      }
    }
  }

  const cleanupTimer = setInterval(pruneExpiredEntries, cleanupIntervalMs);
  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }

  return async function handleAntiFlood(message, context) {
    if (!context.isGroup || !context.groupConfig?.features?.antiFlood) {
      return false;
    }

    if (context.senderIsAdmin || !context.botIsAdmin) {
      return false;
    }

    const threshold = context.groupConfig.antiFlood?.repeatedMessagesThreshold ?? config.antiFlood?.repeatedMessagesThreshold ?? 10;
    const windowMs = context.groupConfig.antiFlood?.windowMs ?? config.antiFlood?.windowMs ?? 15000;
    const minMessageLength = context.groupConfig.antiFlood?.minMessageLength ?? config.antiFlood?.minMessageLength ?? 2;

    const normalizedText = normalizeMessageText(message.body);
    if (!normalizedText || normalizedText.length < minMessageLength) {
      return false;
    }

    const now = Date.now();
    const key = `${context.chatId}:${context.senderId}:${normalizedText}`;
    const entry = tracker.get(key) || { timestamps: [] };

    entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp <= windowMs);
    entry.timestamps.push(now);
    tracker.set(key, entry);

    if (entry.timestamps.length < threshold) {
      return false;
    }

    tracker.delete(key);

    try {
      await message.delete(true);
    } catch {}

    const participantId = await resolveParticipantId(client, context.participants, context.senderId);
    if (!participantId) {
      logger.runtimeWarn('anti_flood.participant_unresolved', logger.buildMessageMeta(context, {
        repeatedCount: entry.timestamps.length,
      }));
      return false;
    }

    try {
      await context.chat.removeParticipants([participantId]);
    } catch (error) {
      logger.runtimeError('anti_flood.remove_failed', error, logger.buildMessageMeta(context, {
        participantId,
      }));
      return false;
    }

    await client.sendMessage(
      context.chatId,
      moderation(
        'Anti-flood',
        `@${idToHandle(participantId)} foi removido(a) por floodar mensagens repetidas.`,
      ),
      { mentions: [participantId] },
    );

    logger.groupEvent('anti_flood.removed', context, {
      participantId,
      repeatedCount: entry.timestamps.length,
      windowMs,
    });

    await ownerNotifications.notifyModerationEvent(client, 'Anti-flood acionado', [
      `Grupo: ${context.chatName || context.chatId}`,
      `Membro: ${participantId}`,
      `Repeticoes: ${entry.timestamps.length}`,
      `Janela: ${windowMs}ms`,
    ]);

    return true;
  };
};
