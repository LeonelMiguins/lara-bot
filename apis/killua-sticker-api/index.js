const StickerPackAPI = require("./api/StickerPackAPI");
const { createStickerAPI } = require("./api/defaultApi");
const clearCache = require("./api/clearCache");
const getConfig = require("./api/getConfig");
const reloadConfig = require("./api/reloadConfig");
const getAvailableCommands = require("./api/getAvailableCommands");
const getCategories = require("./api/getCategories");
const getAllPacks = require("./api/getAllPacks");
const getPacksByCategory = require("./api/getPacksByCategory");
const getPackInfo = require("./api/getPackInfo");
const getPackManifest = require("./api/getPackManifest");
const getPack = require("./api/getPack");
const getSticker = require("./api/getSticker");
const hasPack = require("./api/hasPack");
const findPacks = require("./api/findPacks");
const getRandomPack = require("./api/getRandomPack");
const getRandomSticker = require("./api/getRandomSticker");

module.exports = {
  StickerPackAPI,
  createStickerAPI,
  clearCache,
  getConfig,
  reloadConfig,
  getAvailableCommands,
  getCategories,
  getAllPacks,
  getPacksByCategory,
  getPackInfo,
  getPackManifest,
  getPack,
  getSticker,
  hasPack,
  findPacks,
  getRandomPack,
  getRandomSticker,
};
