const path = require("path");

const DEFAULT_PACKS_DIR = path.join(process.cwd(), "packs");
const DEFAULT_USER_CONFIG_PATH = path.join(process.cwd(), "user", "config.json");
const MANIFEST_NAMES = ["data.json", "pack-info.json"];
const DEFAULT_CONFIG = {
  filters: {
    allowAdult: true,
    blockedCategories: [],
    blockedPackIds: [],
  },
};

const PUBLIC_COMMANDS = [
  {
    name: "getCategories",
    signature: "getCategories()",
    description: "Retorna todas as categorias visiveis.",
  },
  {
    name: "getAllPacks",
    signature: "getAllPacks()",
    description: "Retorna todos os packs visiveis.",
  },
  {
    name: "getPacksByCategory",
    signature: "getPacksByCategory(category)",
    description: "Retorna os packs visiveis de uma categoria.",
  },
  {
    name: "getPackInfo",
    signature: "getPackInfo(packId)",
    description: "Retorna os metadados de um pack.",
  },
  {
    name: "getPackManifest",
    signature: "getPackManifest(packId)",
    description: "Retorna o manifesto interno do .kpack.",
  },
  {
    name: "getPack",
    signature: "getPack(packId, options?)",
    description: "Retorna o pack com todas as stickers.",
  },
  {
    name: "getSticker",
    signature: "getSticker(packId, stickerFileName, options?)",
    description: "Retorna uma figurinha especifica de um pack.",
  },
  {
    name: "hasPack",
    signature: "hasPack(packId)",
    description: "Verifica se o pack esta disponivel pelas regras atuais.",
  },
  {
    name: "findPacks",
    signature: "findPacks(query)",
    description: "Busca packs visiveis por texto.",
  },
  {
    name: "getRandomPack",
    signature: "getRandomPack(category?)",
    description: "Retorna um pack aleatorio visivel.",
  },
  {
    name: "getRandomSticker",
    signature: "getRandomSticker(packId, options?)",
    description: "Retorna uma figurinha aleatoria de um pack visivel.",
  },
  {
    name: "getConfig",
    signature: "getConfig()",
    description: "Retorna a configuracao ativa da API.",
  },
  {
    name: "reloadConfig",
    signature: "reloadConfig()",
    description: "Recarrega o arquivo user/config.json.",
  },
  {
    name: "getAvailableCommands",
    signature: "getAvailableCommands()",
    description: "Lista todos os comandos publicos disponiveis na API.",
  },
  {
    name: "clearCache",
    signature: "clearCache()",
    description: "Limpa os caches internos de packs e zips.",
  },
];

module.exports = {
  DEFAULT_PACKS_DIR,
  DEFAULT_USER_CONFIG_PATH,
  MANIFEST_NAMES,
  DEFAULT_CONFIG,
  PUBLIC_COMMANDS,
};
