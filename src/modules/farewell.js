const config = require('../config/config');
const { loadGroupSettings } = require('../services/groupSettingsService');
const logger = require('../services/loggerService');
const { info } = require('../utils/respond');

module.exports = function setupFarewell(client) {
  client.on('group_leave', async (notification) => {
    try {
      const chat = await notification.getChat();
      const groupSettings = loadGroupSettings(chat.id._serialized);
      if (!groupSettings.features?.farewell) {
        return;
      }

      const contacts = await notification.getRecipients();

      for (const contact of contacts) {
        const displayName = contact.pushname || contact.name || contact.number || 'membro';
        const text = info(
          'Saida do grupo',
          [
            `*${displayName}* saiu do *${chat.name || 'grupo'}*.`,
            '',
            `Use *${config.prefix}regras* para consultar as regras do grupo.`,
          ].join('\n'),
        );

        await client.sendMessage(chat.id._serialized, text);

        logger.groupEvent('farewell.sent', {
          chatId: chat.id._serialized,
          chatName: chat.name,
          isGroup: true,
        }, {
          participantId: contact.id._serialized,
          participantName: displayName,
        });
      }
    } catch (error) {
      logger.runtimeError('farewell.failed', error);
    }
  });
};
