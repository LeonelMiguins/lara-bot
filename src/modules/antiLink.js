const config = require('../config/config');
const logger = require('../services/loggerService');
const ownerNotifications = require('../services/ownerNotificationService');
const { resolveParticipantId } = require('../services/whatsappIdentityService');
const { moderation } = require('../utils/respond');
const { idToHandle } = require('../utils/wweb');

function findBlockedMatch(text, blacklist) {
  const lowered = String(text || '').toLowerCase();
  const categories = [
    {
      reason: 'Compartilhar links de grupos, comunidades ou canais do WhatsApp nao e permitido aqui.',
      shouldKick: true,
      patterns: blacklist.whatsappGroupLinks,
    },
    {
      reason: 'Links com conteudo adulto nao sao permitidos neste grupo.',
      shouldKick: false,
      patterns: blacklist.adultSites,
    },
    {
      reason: 'Links de apostas nao sao permitidos neste grupo.',
      shouldKick: false,
      patterns: blacklist.betsSites,
    },
  ];

  for (const category of categories) {
    const matched = category.patterns.find((pattern) => lowered.includes(pattern));
    if (matched) {
      return { ...category, matched };
    }
  }

  return null;
}

module.exports = function setupAntiLink(client) {
  return async function handleAntiLink(message, context) {
    if (!context.isGroup || !context.groupConfig?.features?.antiLink) {
      return false;
    }

    const text = String(message.body || '').trim();
    if (!text) {
      return false;
    }

    const blocked = findBlockedMatch(text, context.groupConfig.blacklist || config.blacklist);
    if (!blocked) {
      return false;
    }

    const participantId = await resolveParticipantId(client, context.participants, context.senderId);
    const senderId = participantId || context.senderId;
    const chat = context.chat;

    if (context.senderIsAdmin) {
      return false;
    }

    try {
      await message.delete(true);
    } catch {}

    if (blocked.shouldKick && context.botIsAdmin) {
      try {
        await chat.removeParticipants([senderId]);
        logger.groupEvent('anti_link.removed', context, {
          participantId: senderId,
          category: blocked.reason,
        });
      } catch (error) {
        logger.runtimeError('anti_link.remove_failed', error, logger.buildMessageMeta(context, {
          participantId: senderId,
          matched: blocked.matched,
        }));
      }
    }

    await client.sendMessage(
      context.chatId,
      moderation('Anti-link', `@${idToHandle(senderId)} ${blocked.reason}`),
      { mentions: [senderId] },
    );

    logger.groupEvent('anti_link.blocked', context, {
      participantId: senderId,
      reason: blocked.reason,
      matched: blocked.matched,
      kicked: blocked.shouldKick && context.botIsAdmin,
    });

    await ownerNotifications.notifyModerationEvent(client, 'Anti-link acionado', [
      `Grupo: ${context.chatName || context.chatId}`,
      `Membro: ${senderId}`,
      `Motivo: ${blocked.reason}`,
      `Correspondencia: ${blocked.matched}`,
      `Removido: ${(blocked.shouldKick && context.botIsAdmin) ? 'sim' : 'nao'}`,
    ]);

    return true;
  };
};
