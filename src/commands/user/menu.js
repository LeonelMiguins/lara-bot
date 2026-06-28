const { buildMenuText } = require('../../services/menuService');

module.exports = {
  name: 'menu',
  aliases: ['help'],
  description: 'Mostra o menu principal.',
  menuExample: `#menu`,
  groupOnly: false,
  adminOnly: false,
  async execute({ client, chatId, senderIsOwner, commandPrefix }) {
    const text = buildMenuText({ senderIsOwner, commandPrefix });
    await client.sendMessage(chatId, text);
  },
};
