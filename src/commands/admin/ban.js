const config = require('../../config/config');
const { error, moderation, warning } = require('../../utils/respond');
const { getParticipantId, normalizeChatId, resolveParticipant, toContactId } = require('../../utils/wweb');

function extractTargetFromText(text) {
  const match = text.match(/@?(\d{10,16})/);
  return match ? toContactId(match[1]) : '';
}

module.exports = {
  name: 'ban',
  aliases: ['kick'],
  description: 'Remove um membro do grupo.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, message, chat, chatId, body, participants, mentions, quotedMessage }) {
    const fromMention = mentions[0];
    const fromReply = quotedMessage?.author || quotedMessage?.from || '';
    const fromText = extractTargetFromText(body);
    const target = normalizeChatId(fromMention || fromReply || fromText);

    if (!target) {
      await client.sendMessage(
        chatId,
        warning('Remover membro', `Marque um membro ou responda a mensagem dele com *${config.prefix}ban*.`),
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
  },
};
