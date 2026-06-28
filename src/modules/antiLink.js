const config = require('../config/config');
const logger = require('../services/loggerService');
const { getPhrase } = require('../services/messagePhraseService');
const ownerNotifications = require('../services/ownerNotificationService');
const { resolveParticipantId } = require('../services/whatsappIdentityService');
const { moderation } = require('../utils/respond');
const { idToHandle } = require('../utils/wweb');

function findBlockedMatch(text, blacklist) {
  const lowered = String(text || '').toLowerCase();
  const categories = [
    {
      category: 'whatsappGroupLinks',
      reason: getPhrase('modules.anti_link_reason_whatsapp'),
      patterns: blacklist.whatsappGroupLinks,
    },
    {
      category: 'adultSites',
      reason: getPhrase('modules.anti_link_reason_adult'),
      patterns: blacklist.adultSites,
    },
    {
      category: 'betsSites',
      reason: getPhrase('modules.anti_link_reason_bets'),
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

    try {
      await client.sendMessage(
        context.chatId,
        moderation(
          getPhrase('modules.anti_link_title'),
          getPhrase('modules.anti_link_moderation_line', {
            member_handle: idToHandle(senderId),
            reason: blocked.reason,
          }),
        ),
        { mentions: [senderId] },
      );
    } catch (error) {
      logger.runtimeError('anti_link.notice_failed', error, logger.buildMessageMeta(context, {
        participantId: senderId,
        matched: blocked.matched,
      }));
    }

    logger.groupEvent('anti_link.blocked', context, {
      participantId: senderId,
      category: blocked.category,
      reason: blocked.reason,
      matched: blocked.matched,
      action,
      targetMode,
      kicked: action === 'ban' && context.botIsAdmin,
    });

    try {
      await ownerNotifications.notifyModerationEvent(client, 'Anti-link acionado', [
        `Grupo: ${context.chatName || context.chatId}`,
        `Membro: ${senderId}`,
        `${getPhrase('labels.reason')}: ${blocked.reason}`,
        `Correspondencia: ${blocked.matched}`,
        `Escopo: ${targetMode === 'all' ? 'qualquer pessoa' : 'apenas usuarios comuns'}`,
        `Acao: ${action === 'ban' ? 'apagar e banir' : 'apenas apagar'}`,
        `Removido: ${(action === 'ban' && context.botIsAdmin) ? 'sim' : 'nao'}`,
      ]);
    } catch (error) {
      logger.runtimeError('anti_link.owner_notice_failed', error, logger.buildMessageMeta(context, {
        participantId: senderId,
        matched: blocked.matched,
      }));
    }

    return true;
  };
};
