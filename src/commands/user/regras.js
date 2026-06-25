const config = require('../../config/config');
const { info } = require('../../utils/respond');

module.exports = {
  name: 'regras',
  aliases: ['rules'],
  description: 'Mostra as regras do grupo.',
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chatName }) {
    const rules = config.groupRules
      .map((rule, index) => `🚫 ${index + 1}. ${rule}`)
      .join('\n');

    await client.sendMessage(chatId, info(`Regras de ${chatName || 'grupo'}`, rules));
  },
};
