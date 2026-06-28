const config = require('../../config/config');
const { info, warning } = require('../../utils/respond');

module.exports = {
  name: 'grupos',
  aliases: ['groups', 'listagrupos', 'todosgrupos'],
  description: 'Lista todos os grupos em que o bot esta inserido.',
  menuExample: `${config.prefix}grupos`,
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,
  async execute({ client, chatId, commandPrefix }) {
    const chats = await client.getChats();
    const groups = chats.filter((chat) => chat.isGroup);

    if (!groups.length) {
      await client.sendMessage(chatId, warning('Grupos do bot', 'Nao encontrei grupos disponiveis neste momento.'));
      return;
    }

    const lines = groups
      .slice(0, 50)
      .map((group, index) => `${index + 1}. ${group.name || 'Sem nome'}\n${group.id._serialized}`);

    await client.sendMessage(
      chatId,
      info(
        'Grupos do bot',
        [
          `Total de grupos: ${groups.length}`,
          '',
          '*Use estes IDs no privado do bot*',
          '',
          ...lines,
          '',
          `Exemplo: *${commandPrefix}antilink --grupo <ID_DO_GRUPO> on*`,
        ].join('\n'),
      ),
    );
  },
};
