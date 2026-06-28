const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, error } = require('../../utils/respond');

module.exports = {
  name: 'link',
  aliases: ['invite'],
  description: 'Mostra o link de convite do grupo.',
  menuExample: `#link`,
  help: {
    summary: 'Mostra o link de convite do grupo atual.',
    examples: [
      '#link',
    ],
    notes: [
      'O bot precisa ser administrador para conseguir gerar o link.',
    ],
  },
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chat, chatName, botIsAdmin }) {
    if (!botIsAdmin) {
      await client.sendMessage(chatId, error(getPhrase('commands.link.title'), getPhrase('commands.link.need_admin')));
      return;
    }

    const inviteCode = await chat.getInviteCode();
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

    await client.sendMessage(
      chatId,
      commandPanel(getPhrase('commands.link.title'), {
        sections: [
          createSection(getPhrase('labels.group_link_section'), [
            getPhrase('commands.link.name_line', { value: chatName || chat.name || getPhrase('commands.common.no_name') }),
            inviteLink,
          ]),
        ],
      }),
    );
  },
};
