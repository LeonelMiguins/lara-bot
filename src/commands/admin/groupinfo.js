const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection } = require('../../utils/respond');

module.exports = {
  name: 'groupinfo',
  aliases: ['infogroup'],
  description: 'Mostra informacoes do grupo.',
  menuExample: `${config.prefix}groupinfo`,
  help: {
    summary: 'Mostra um resumo completo do grupo atual.',
    examples: [
      '#groupinfo',
    ],
    notes: [
      'Exibe nome, ID, quantidade de membros, admins e descricao do grupo.',
    ],
  },
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chat, participants, chatName }) {
    const admins = participants.filter(
      (participant) => participant.isAdmin || participant.isSuperAdmin,
    ).length;

    await client.sendMessage(
      chatId,
      commandPanel(getPhrase('commands.groupinfo.title'), {
        sections: [
          createSection(getPhrase('labels.group_summary'), [
            getPhrase('commands.groupinfo.name_line', { value: chatName || chat.name || getPhrase('commands.common.no_name') }),
            getPhrase('commands.groupinfo.id_line', { value: chat.id._serialized }),
            getPhrase('commands.groupinfo.members_line', { value: participants.length }),
            getPhrase('commands.groupinfo.admins_line', { value: admins }),
            getPhrase('commands.groupinfo.description_line', { value: chat.description || getPhrase('commands.groupinfo.description_empty') }),
          ]),
        ],
      }),
    );
  },
};
