const config = require('../config/config');
const { moderation } = require('../utils/respond');
const { idToHandle, resolveParticipantId } = require('../utils/wweb');
const { nowLabel } = require('../utils/text');

function normalizeMessageText(text) {
  return String(text || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

module.exports = function setupAntiFlood(client) {
  const tracker = new Map();
  const threshold = config.antiFlood?.repeatedMessagesThreshold ?? 10;
  const windowMs = config.antiFlood?.windowMs ?? 15000;
  const minMessageLength = config.antiFlood?.minMessageLength ?? 2;
  const cleanupIntervalMs = config.antiFlood?.cleanupIntervalMs ?? 60000;

  function pruneExpiredEntries() {
    const now = Date.now();

    for (const [key, entry] of tracker.entries()) {
      entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp <= windowMs);

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
    if (!config.features.antiFlood || !context.isGroup) {
      return false;
    }

    if (context.senderIsAdmin || !context.botIsAdmin) {
      return false;
    }

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
      console.error('Erro ao remover participante por flood: participante nao resolvido.');
      return false;
    }

    try {
      await context.chat.removeParticipants([participantId]);
    } catch (error) {
      console.error('Erro ao remover participante por flood:', error.message);
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

    console.log(
      `[${nowLabel()}] [ANTI-FLOOD] ${context.senderId} removido(a) por repetir ${entry.timestamps.length} mensagens em ${windowMs}ms.`,
    );

    return true;
  };
};
