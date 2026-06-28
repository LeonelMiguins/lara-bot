const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const { promoteParticipant } = require('../../services/commands/adminModerationService');
const { error, invalidUsage, success, warning } = require('../../utils/respond');

module.exports = {
  name: 'adm',
  aliases: ['promote'],
  description: 'Promove um membro a administrador.',
  menuExample: `${config.prefix}adm @membro`,
  help: {
    summary: 'Promove um membro do grupo para administrador.',
    examples: [
      '#adm @membro',
      '#adm',
      '#adm 5511999999999',
    ],
    notes: [
      'Voce pode marcar o membro, responder a mensagem dele ou informar o numero.',
      'So funciona em grupos e exige permissao de administrador.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chat, chatId, body, mentions, quotedMessage, participants, chatName, commandPrefix }) {
    const result = await promoteParticipant({
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
        invalidUsage(getPhrase('commands.adm.title'), [
          getPhrase('commands.adm.usage_mention', { prefix: commandPrefix }),
          getPhrase('commands.adm.usage_reply', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    if (result.status === 'participant_not_found') {
      await client.sendMessage(chatId, error(getPhrase('commands.adm.title'), getPhrase('commands.adm.not_found')));
      return;
    }

    if (result.status === 'already_admin') {
      await client.sendMessage(chatId, warning(getPhrase('commands.adm.title'), getPhrase('commands.adm.already_admin')));
      return;
    }

    const participantId = result.participantId;
    await client.sendMessage(
      chatId,
      success(getPhrase('commands.adm.title'), getPhrase('commands.adm.promoted', {
        member_handle: participantId.split('@')[0],
      })),
      {
        mentions: [participantId],
      },
    );
  },
};
