const { commandPanel, createSection, warning } = require('../../utils/respond');

module.exports = {
  name: 'adms',
  aliases: ['admins'],
  description: 'Menciona todos os administradores do grupo.',
  menuExample: `#adms`,
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, participants }) {
    const admins = participants
      .filter((participant) => participant.isAdmin || participant.isSuperAdmin)
      .map((participant) => participant.id?._serialized)
      .filter(Boolean);

    if (!admins.length) {
      await client.sendMessage(chatId, warning('Administradores', 'Nao encontrei administradores nesse grupo.'));
      return;
    }

    const text = admins.map((jid) => `@${jid.split('@')[0]}`).join(' ');
    await client.sendMessage(chatId, commandPanel('Administradores', {
      sections: [
        createSection('Administracao', [text]),
      ],
    }), {
      mentions: admins,
    });
  },
};
