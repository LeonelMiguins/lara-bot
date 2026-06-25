const config = require('../config/config');
const { moderation } = require('../utils/respond');
const { idToHandle, resolveParticipantId } = require('../utils/wweb');

function findBlockedMatch(text) {
  const lowered = String(text || '').toLowerCase();
  const categories = [
    {
      reason: 'Compartilhar links de grupos, comunidades ou canais do WhatsApp nao e permitido aqui.',
      shouldKick: true,
      patterns: config.blacklist.whatsappGroupLinks,
    },
    {
      reason: 'Links com conteudo adulto nao sao permitidos neste grupo.',
      shouldKick: false,
      patterns: config.blacklist.adultSites,
    },
    {
      reason: 'Links de apostas nao sao permitidos neste grupo.',
      shouldKick: false,
      patterns: config.blacklist.betsSites,
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
    if (!config.features.antiLink || !context.isGroup) {
      return false;
    }

    const text = String(message.body || '').trim();
    if (!text) {
      return false;
    }

    const blocked = findBlockedMatch(text);
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
      } catch {}
    }

    await client.sendMessage(
      context.chatId,
      moderation('Anti-link', `@${idToHandle(senderId)} ${blocked.reason}`),
      { mentions: [senderId] },
    );

    return true;
  };
};
