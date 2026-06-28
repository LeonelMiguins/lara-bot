const { buildMenuText } = require('../../services/menuService');

module.exports = {
  name: 'menu',
  aliases: [],
  description: 'Mostra o menu principal.',
  menuExample: `#menu`,
  help: {
    summary: 'Mostra o menu principal com os comandos disponiveis para o contexto atual.',
    examples: [
      '#menu',
    ],
    notes: [
      'O conteudo exibido muda conforme o usuario e dono do bot ou nao.',
    ],
  },
  groupOnly: false,
  adminOnly: false,
  async execute({ client, chatId, senderIsOwner, commandPrefix }) {
    const text = buildMenuText({ senderIsOwner, commandPrefix });
    await client.sendMessage(chatId, text);
  },
};
