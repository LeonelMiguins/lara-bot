const config = require('../../config/config');
const ownerNotifications = require('../../services/ownerNotificationService');
const { resolveParticipant } = require('../../services/whatsappIdentityService');
const { error, invalidUsage, moderation, warning } = require('../../utils/respond');
const { getParticipantId, normalizeChatId, toContactId } = require('../../utils/wweb');

function extractTargetFromText(text) {
  const match = text.match(/@?(\d{10,16})/);
  return match ? toContactId(match[1]) : '';
}

module.exports = {
  name: 'ban',
  aliases: ['kick'],
  description: 'Remove um membro do grupo.',
  menuExample: `${config.prefix}ban @membro`,
  help: {
    summary: 'Remove um membro do grupo.',
    examples: [
      '#ban @membro',
      '#ban',
      '#ban 5511999999999',
    ],
    notes: [
      'Voce pode marcar o membro, responder a mensagem dele ou informar o numero.',
      'O comando nao remove outros administradores.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, message, chat, chatId, body, participants, mentions, quotedMessage, chatName, commandPrefix }) {
    const fromMention = mentions[0];
    const fromReply = quotedMessage?.author || quotedMessage?.from || '';
    const fromText = extractTargetFromText(body);
    const target = normalizeChatId(fromMention || fromReply || fromText);

    if (!target) {
      await client.sendMessage(
        chatId,
        invalidUsage('Remover membro', [
          `Marque um membro e use *${commandPrefix}ban @membro*.`,
          `Ou responda a mensagem do membro usando apenas *${commandPrefix}ban*.`,
        ]),
      );
      return;
    }

    const participant = await resolveParticipant(client, participants, target);
    if (!participant) {
      await client.sendMessage(chatId, error('Remover membro', 'Nao encontrei esse membro no grupo.'));
      return;
    }

    if (participant.isAdmin || participant.isSuperAdmin) {
      await client.sendMessage(chatId, warning('Remover membro', 'Nao posso remover outro administrador.'));
      return;
    }

    const participantId = getParticipantId(participant);
    await chat.removeParticipants([participantId]);
    await client.sendMessage(
      chatId,
      moderation('Remover membro', `@${participantId.split('@')[0]} foi removido(a) do grupo.`),
      {
        mentions: [participantId],
      },
    );

    await ownerNotifications.notifyModerationEvent(client, 'Remocao de membro', [
      `Grupo: ${chatName || chat.name || chatId}`,
      `Membro: ${participantId}`,
      'Acao: removido do grupo',
    ]);
  },
};
