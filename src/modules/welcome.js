const { loadGroupSettings } = require('../services/groupSettingsService');
const logger = require('../services/loggerService');
const { getEffectivePrefix } = require('../services/prefixService');
const { info } = require('../utils/respond');

module.exports = function setupWelcome(client) {
  client.on('group_join', async (notification) => {
    try {
      const chat = await notification.getChat();
      const groupSettings = loadGroupSettings(chat.id._serialized);
      const commandPrefix = getEffectivePrefix({ isGroup: true, groupSettings });
      if (!groupSettings.features?.welcome) {
        return;
      }

      const contacts = await notification.getRecipients();

      for (const contact of contacts) {
        const displayName = contact.pushname || contact.name || contact.number || 'novo membro';
        const text = info(
          'Boas-vindas',
          [
            `Ola, *${displayName}*!`,
            `Seja bem-vindo(a) ao *${chat.name || 'grupo'}*.`,
            '',
            `Use *${commandPrefix}menu* para ver os comandos.`,
            `Use *${commandPrefix}regras* para ler as regras do grupo.`,
          ].join('\n'),
        );

        await client.sendMessage(chat.id._serialized, text, {
          mentions: [contact.id._serialized],
        });

        logger.groupEvent('welcome.sent', {
          chatId: chat.id._serialized,
          chatName: chat.name,
          isGroup: true,
        }, {
          participantId: contact.id._serialized,
          participantName: displayName,
        });
      }
    } catch (error) {
      logger.runtimeError('welcome.failed', error);
    }
  });
};
