const config = require('../../config/config');
const { commandPanel, createSection } = require('../../utils/respond');

module.exports = {
  name: 'groupinfo',
  aliases: ['infogroup'],
  description: 'Mostra informacoes do grupo.',
  menuExample: `${config.prefix}groupinfo`,
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chat, participants, chatName }) {
    const admins = participants.filter(
      (participant) => participant.isAdmin || participant.isSuperAdmin,
    ).length;

    await client.sendMessage(
      chatId,
      commandPanel('Informacoes do grupo', {
        sections: [
          createSection('Resumo', [
            `Nome: ${chatName || chat.name || 'Sem nome'}`,
            `ID: ${chat.id._serialized}`,
            `Membros: ${participants.length}`,
            `Admins: ${admins}`,
            `Descricao: ${chat.description || 'Sem descricao'}`,
          ]),
        ],
      }),
    );
  },
};
