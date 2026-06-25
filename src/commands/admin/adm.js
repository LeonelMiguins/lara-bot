const config = require('../../config/config');
const ownerNotifications = require('../../services/ownerNotificationService');
const { resolveParticipant } = require('../../services/whatsappIdentityService');
const { error, success, warning } = require('../../utils/respond');
const { getParticipantId, normalizeChatId, toContactId } = require('../../utils/wweb');

function extractTargetFromText(text) {
  const match = String(text || '').match(/@?(\d{10,16})/);
  return match ? toContactId(match[1]) : '';
}

module.exports = {
  name: 'adm',
  aliases: ['promote'],
  description: 'Promove um membro a administrador.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, message, chat, chatId, body, mentions, quotedMessage, participants, chatName }) {
    const target = normalizeChatId(
      mentions[0] || quotedMessage?.author || quotedMessage?.from || extractTargetFromText(body),
    );

    if (!target) {
      await client.sendMessage(
        chatId,
        warning('Promover administrador', `Marque um membro ou responda a mensagem dele com *${config.prefix}adm*.`),
      );
      return;
    }

    const participant = await resolveParticipant(client, participants, target);
    if (!participant) {
      await client.sendMessage(chatId, error('Promover administrador', 'Nao encontrei esse membro no grupo.'));
      return;
    }

    if (participant.isAdmin || participant.isSuperAdmin) {
      await client.sendMessage(chatId, warning('Promover administrador', 'Esse membro ja e administrador.'));
      return;
    }

    const participantId = getParticipantId(participant);
    await chat.promoteParticipants([participantId]);
    await client.sendMessage(
      chatId,
      success('Promover administrador', `@${participantId.split('@')[0]} foi promovido(a) a administrador(a).`),
      {
        mentions: [participantId],
      },
    );

    await ownerNotifications.notifyModerationEvent(client, 'Promocao de administrador', [
      `Grupo: ${chatName || chat.name || chatId}`,
      `Membro: ${participantId}`,
      'Acao: promovido a administrador',
    ]);
  },
};
