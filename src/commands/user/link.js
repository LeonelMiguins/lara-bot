const { commandPanel, createSection, error } = require('../../utils/respond');

module.exports = {
  name: 'link',
  aliases: ['invite'],
  description: 'Mostra o link de convite do grupo.',
  menuExample: `#link`,
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chat, chatName, botIsAdmin }) {
    if (!botIsAdmin) {
      await client.sendMessage(chatId, error('Link do grupo', 'Eu preciso ser administrador para gerar o link do grupo.'));
      return;
    }

    const inviteCode = await chat.getInviteCode();
    const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

    await client.sendMessage(
      chatId,
      commandPanel('Link do grupo', {
        sections: [
          createSection('Grupo', [
            `Nome: ${chatName || chat.name || 'Sem nome'}`,
            inviteLink,
          ]),
        ],
      }),
    );
  },
};
