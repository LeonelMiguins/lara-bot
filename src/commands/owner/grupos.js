const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, warning } = require('../../utils/respond');

module.exports = {
  name: 'grupos',
  aliases: ['groups', 'listagrupos', 'todosgrupos'],
  description: 'Lista todos os grupos em que o bot esta inserido.',
  menuExample: `${config.prefix}grupos`,
  help: {
    summary: 'Lista todos os grupos onde o bot esta presente.',
    examples: [
      '#grupos',
    ],
    notes: [
      'Comando exclusivo do dono do bot.',
      'A lista ajuda no uso de comandos privados com --grupo <ID_DO_GRUPO>.',
    ],
  },
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,
  async execute({ client, chatId, commandPrefix }) {
    const chats = await client.getChats();
    const groups = chats.filter((chat) => chat.isGroup);

    if (!groups.length) {
      await client.sendMessage(chatId, warning(getPhrase('commands.grupos.title'), getPhrase('commands.grupos.none_found')));
      return;
    }

    const lines = groups
      .slice(0, 50)
      .map((group, index) => `${index + 1}. ${group.name || 'Sem nome'}\n${group.id._serialized}`);

    await client.sendMessage(
      chatId,
      commandPanel(getPhrase('commands.grupos.title'), {
        sections: [
          createSection(getPhrase('labels.summary'), [getPhrase('commands.grupos.total_line', { count: groups.length })]),
          createSection(getPhrase('labels.private_group_ids'), lines),
        ],
        footer: [
          getPhrase('commands.grupos.footer_example', { prefix: commandPrefix }),
        ],
      }),
    );
  },
};
