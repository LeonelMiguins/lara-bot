const logger = require('../services/loggerService');
const { loadGroupSettings, updateStickerSettings } = require('../services/groupSettingsService');
const { resolveAutoPackForGroup } = require('../services/commands/stickerCommandService');
const { sendPackToChat } = require('../services/stickerPackService');

module.exports = function setupStickerAuto(client) {
  let running = false;

  const timer = setInterval(async () => {
    if (running || !client.info?.wid?._serialized) {
      return;
    }

    running = true;
    try {
      const chats = await client.getChats();
      const groups = chats.filter((chat) => chat.isGroup);
      const now = Date.now();

      for (const chat of groups) {
        const chatId = chat.id._serialized;
        const groupSettings = loadGroupSettings(chatId);
        const stickerSettings = groupSettings?.stickers || {};
        const enabled = Boolean(groupSettings?.features?.stickerAuto);
        const intervalMinutes = Number(stickerSettings.autoSendIntervalMinutes || 0);

        if (!enabled || !Number.isFinite(intervalMinutes) || intervalMinutes < 5) {
          continue;
        }

        const lastAutoSentAt = stickerSettings.lastAutoSentAt ? Date.parse(stickerSettings.lastAutoSentAt) : 0;
        const intervalMs = intervalMinutes * 60 * 1000;

        if (lastAutoSentAt && now - lastAutoSentAt < intervalMs) {
          continue;
        }

        const pack = await resolveAutoPackForGroup(groupSettings);
        if (!pack) {
          continue;
        }

        await sendPackToChat(client, chatId, pack, {
          delayMs: stickerSettings.sendDelayMs,
        });

        updateStickerSettings(chatId, {
          lastAutoSentAt: new Date().toISOString(),
        });

        logger.groupEvent('stickers.auto_pack.sent', {
          chatId,
          chatName: chat.name,
          isGroup: true,
        }, {
          packId: pack.id,
          category: pack.category,
          adult: pack.adult === true,
        });
      }
    } catch (error) {
      logger.runtimeError('stickers.auto_pack.failed', error);
    } finally {
      running = false;
    }
  }, 60000);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }
};
