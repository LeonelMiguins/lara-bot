const { buildMenuText } = require('../../services/menuService');
const { info } = require('../../utils/respond');

module.exports = {
  name: 'menu',
  aliases: ['help'],
  description: 'Mostra o menu principal.',
  menuExample: `#menu`,
  groupOnly: false,
  adminOnly: false,
  async execute({ client, chatId, senderIsOwner, commandPrefix }) {
    const text = buildMenuText({ senderIsOwner, commandPrefix });
    await client.sendMessage(chatId, info('Menu principal', text));
  },
};
