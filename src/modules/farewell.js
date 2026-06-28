const { loadGroupSettings } = require('../services/groupSettingsService');
const logger = require('../services/loggerService');
const { getEffectivePrefix } = require('../services/prefixService');
const { info } = require('../utils/respond');

module.exports = function setupFarewell(client) {
  client.on('group_leave', async (notification) => {
    try {
      const chat = await notification.getChat();
      const groupSettings = loadGroupSettings(chat.id._serialized);
      const commandPrefix = getEffectivePrefix({ isGroup: true, groupSettings });
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
            `Use *${commandPrefix}regras* para consultar as regras do grupo.`,
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
