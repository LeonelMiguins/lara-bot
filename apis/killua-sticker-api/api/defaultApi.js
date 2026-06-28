const StickerPackAPI = require("./StickerPackAPI");

const defaultApi = new StickerPackAPI();

function createStickerAPI(options) {
  return new StickerPackAPI(options);
}

module.exports = {
  defaultApi,
  createStickerAPI,
};
