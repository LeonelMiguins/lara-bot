const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../config/config');
const { ensureDirectory } = require('../utils/wweb');

const apiRoot = path.resolve(process.cwd(), 'apis', 'killua-sticker-api');
const { StickerPackAPI } = require(path.join(apiRoot, 'api'));

const stickerConfigDir = path.resolve(config.paths.systemDataDir, 'stickers');
const safeConfigPath = path.join(stickerConfigDir, 'safe-config.json');
const adultConfigPath = path.join(stickerConfigDir, 'adult-config.json');
const packsDir = path.join(apiRoot, 'packs');

function ensureStickerConfigs() {
  ensureDirectory(stickerConfigDir);

  if (!fs.existsSync(safeConfigPath)) {
    fs.writeFileSync(safeConfigPath, JSON.stringify({
      filters: {
        allowAdult: false,
        blockedCategories: [],
        blockedPackIds: [],
      },
    }, null, 2));
  }

  if (!fs.existsSync(adultConfigPath)) {
    fs.writeFileSync(adultConfigPath, JSON.stringify({
      filters: {
        allowAdult: true,
        blockedCategories: [],
        blockedPackIds: [],
      },
    }, null, 2));
  }
}

ensureStickerConfigs();

const safeApi = new StickerPackAPI({
  packsDir,
  configPath: safeConfigPath,
});

const adultApi = new StickerPackAPI({
  packsDir,
  configPath: adultConfigPath,
});

function getApi(allowAdult = false) {
  return allowAdult ? adultApi : safeApi;
}

async function getAvailableCategories({ allowAdult = false } = {}) {
  return getApi(allowAdult).getCategories();
}

async function getRandomPackInfo({ allowAdult = false, category = '' } = {}) {
  const api = getApi(allowAdult);
  const normalizedCategory = String(category || '').trim();
  return normalizedCategory ? api.getRandomPack(normalizedCategory) : api.getRandomPack();
}

async function sendStickerBuffer(client, chatId, sticker) {
  const media = new MessageMedia(
    sticker.mimeType || 'image/webp',
    sticker.buffer.toString('base64'),
    sticker.name || 'sticker.webp',
  );

  await client.sendMessage(chatId, media, {
    sendMediaAsSticker: true,
  });
}

async function sendPackToChat(client, chatId, pack, options = {}) {
  const delayMs = Number(options.delayMs ?? config.stickers?.sendDelayMs ?? 700);

  for (let index = 0; index < pack.stickers.length; index += 1) {
    await sendStickerBuffer(client, chatId, pack.stickers[index]);

    if (delayMs > 0 && index < pack.stickers.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function getRandomPackWithStickers({ allowAdult = false, category = '' } = {}) {
  const packInfo = await getRandomPackInfo({ allowAdult, category });
  if (!packInfo) {
    return null;
  }

  const api = getApi(allowAdult);
  return api.getPack(packInfo.id);
}

module.exports = {
  getAvailableCategories,
  getRandomPackInfo,
  getRandomPackWithStickers,
  sendPackToChat,
};
