const config = require('../config/config');
const { info } = require('../utils/respond');

module.exports = function setupWelcome(client) {
  if (!config.features.welcome) {
    return;
  }

  client.on('group_join', async (notification) => {
    try {
      const chat = await notification.getChat();
      const contacts = await notification.getRecipients();

      for (const contact of contacts) {
        const displayName = contact.pushname || contact.name || contact.number || 'novo membro';
        const text = info(
          'Boas-vindas',
          [
            `Ola, *${displayName}*!`,
            `Seja bem-vindo(a) ao *${chat.name || 'grupo'}*.`,
            '',
            `Use *${config.prefix}menu* para ver os comandos.`,
            `Use *${config.prefix}regras* para ler as regras do grupo.`,
          ].join('\n'),
        );

        await client.sendMessage(chat.id._serialized, text, {
          mentions: [contact.id._serialized],
        });
      }
    } catch (error) {
      console.error('Erro ao processar boas-vindas:', error.message);
    }
  });
};
