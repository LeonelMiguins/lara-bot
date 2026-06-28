const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const { removeParticipant } = require('../../services/commands/adminModerationService');
const { error, invalidUsage, moderation, warning } = require('../../utils/respond');

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
  async execute({ client, chat, chatId, body, participants, mentions, quotedMessage, chatName, commandPrefix }) {
    const result = await removeParticipant({
      client,
      chat,
      chatId,
      body,
      mentions,
      quotedMessage,
      participants,
      chatName,
    });

    if (result.status === 'missing_target') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.ban.title'), [
          getPhrase('commands.ban.usage_mention', { prefix: commandPrefix }),
          getPhrase('commands.ban.usage_reply', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    if (result.status === 'participant_not_found') {
      await client.sendMessage(chatId, error(getPhrase('commands.ban.title'), getPhrase('commands.ban.not_found')));
      return;
    }

    if (result.status === 'cannot_remove_admin') {
      await client.sendMessage(chatId, warning(getPhrase('commands.ban.title'), getPhrase('commands.ban.cannot_remove_admin')));
      return;
    }

    const participantId = result.participantId;
    await client.sendMessage(
      chatId,
      moderation(getPhrase('commands.ban.title'), getPhrase('commands.ban.removed', {
        member_handle: participantId.split('@')[0],
      })),
      {
        mentions: [participantId],
      },
    );
  },
};
