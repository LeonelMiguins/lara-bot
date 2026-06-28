const { loadGroupSettings } = require('../services/groupSettingsService');
const logger = require('../services/loggerService');
const { getPhrase } = require('../services/messagePhraseService');
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
          getPhrase('modules.farewell_title'),
          [
            getPhrase('modules.farewell_line_1', { member_name: displayName, group_name: chat.name || 'grupo' }),
            '',
            getPhrase('modules.farewell_line_2', { prefix: commandPrefix }),
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
