const config = require('../../config/config');
const { error, success, warning } = require('../../utils/respond');
const { getParticipantId, normalizeChatId, resolveParticipant } = require('../../utils/wweb');

module.exports = {
  name: 'adm',
  aliases: ['promote'],
  description: 'Promove um membro a administrador.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, message, chat, chatId, mentions, quotedMessage, participants }) {
    const target = normalizeChatId(
      mentions[0] || quotedMessage?.author || quotedMessage?.from || '',
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
  },
};
