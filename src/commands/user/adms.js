const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, warning } = require('../../utils/respond');

module.exports = {
  name: 'adms',
  aliases: ['admins'],
  description: 'Menciona todos os administradores do grupo.',
  menuExample: `#adms`,
  help: {
    summary: 'Lista e menciona todos os administradores do grupo.',
    examples: [
      '#adms',
    ],
    notes: [
      'Qualquer membro do grupo pode usar esse comando.',
    ],
  },
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, participants }) {
    const admins = participants
      .filter((participant) => participant.isAdmin || participant.isSuperAdmin)
      .map((participant) => participant.id?._serialized)
      .filter(Boolean);

    if (!admins.length) {
      await client.sendMessage(chatId, warning(getPhrase('commands.adms.title'), getPhrase('commands.adms.none_found')));
      return;
    }

    const text = admins.map((jid) => `⤷ @${jid.split('@')[0]}\n`).join(' ');
    await client.sendMessage(chatId, commandPanel(getPhrase('commands.adms.title'), {
      sections: [
        createSection(getPhrase('labels.administration'), [text]),
      ],
    }), {
      mentions: admins,
    });
  },
};
