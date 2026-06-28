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
      category: 'whatsappGroupLinks',
      reason: 'Compartilhar links de grupos, comunidades ou canais do WhatsApp nao e permitido aqui.',
      patterns: blacklist.whatsappGroupLinks,
    },
    {
      category: 'adultSites',
      reason: 'Links com conteudo adulto nao sao permitidos neste grupo.',
      patterns: blacklist.adultSites,
    },
    {
      category: 'betsSites',
      reason: 'Links de apostas nao sao permitidos neste grupo.',
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
    const antiLinkSettings = context.groupConfig.antiLink || config.antiLink || {};
    const action = antiLinkSettings[blocked.category] || 'delete';
    const targetMode = antiLinkSettings.targetMode || 'users';

    const participantId = await resolveParticipantId(client, context.participants, context.senderId);
    const senderId = participantId || context.senderId;
    const chat = context.chat;

    if (targetMode === 'users' && (context.senderIsAdmin || context.senderIsOwner)) {
      return false;
    }

    try {
      await message.delete(true);
    } catch {}

    if (action === 'ban' && context.botIsAdmin) {
      try {
        await chat.removeParticipants([senderId]);
        logger.groupEvent('anti_link.removed', context, {
          participantId: senderId,
          category: blocked.category,
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
      category: blocked.category,
      reason: blocked.reason,
      matched: blocked.matched,
      action,
      targetMode,
      kicked: action === 'ban' && context.botIsAdmin,
    });

    await ownerNotifications.notifyModerationEvent(client, 'Anti-link acionado', [
      `Grupo: ${context.chatName || context.chatId}`,
      `Membro: ${senderId}`,
      `Motivo: ${blocked.reason}`,
      `Correspondencia: ${blocked.matched}`,
      `Escopo: ${targetMode === 'all' ? 'qualquer pessoa' : 'apenas usuarios comuns'}`,
      `Acao: ${action === 'ban' ? 'apagar e banir' : 'apenas apagar'}`,
      `Removido: ${(action === 'ban' && context.botIsAdmin) ? 'sim' : 'nao'}`,
    ]);

    return true;
  };
};
