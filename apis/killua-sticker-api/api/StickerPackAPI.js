const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const mime = require("mime-types");
const {
  DEFAULT_PACKS_DIR,
  DEFAULT_USER_CONFIG_PATH,
  DEFAULT_CONFIG,
  PUBLIC_COMMANDS,
} = require("./constants");
const {
  normalizeSlashes,
  isKpackFile,
  isManifestEntry,
  isImageEntry,
  clone,
} = require("./helpers");

class StickerPackAPI {
  constructor(options = {}) {
    this.packsDir = path.resolve(options.packsDir || DEFAULT_PACKS_DIR);
    this.configPath = path.resolve(options.configPath || DEFAULT_USER_CONFIG_PATH);
    this.packIndexCache = null;
    this.zipCache = new Map();
    this.configCache = null;
  }

  clearCache() {
    this.packIndexCache = null;
    this.zipCache.clear();
    this.configCache = null;
  }

  getConfig() {
    if (!this.configCache) {
      this.configCache = this.readConfig();
    }

    return clone(this.configCache);
  }

  reloadConfig() {
    this.configCache = this.readConfig();
    return clone(this.configCache);
  }

  getAvailableCommands() {
    return clone(PUBLIC_COMMANDS);
  }

  async getCategories() {
    const packs = await this.getAllPacks();
    return [...new Set(packs.map((pack) => pack.category))];
  }

  async getAllPacks() {
    if (!this.packIndexCache) {
      this.packIndexCache = this.scanPacks();
    }

    return this.packIndexCache.filter((pack) => this.isPackAllowed(pack)).map((pack) => clone(pack));
  }

  async getPacksByCategory(category) {
    const normalizedCategory = String(category);
    const packs = await this.getAllPacks();
    return packs.filter((pack) => pack.category === normalizedCategory);
  }

  async getPackInfo(identifier, maybeSlug) {
    const packMeta = await this.resolvePack(identifier, maybeSlug);
    return clone(packMeta);
  }

  async getPack(identifier, maybeSlugOrOptions, maybeOptions) {
    const { maybeSlug, options } = this.normalizePackArgs(maybeSlugOrOptions, maybeOptions);
    const packMeta = await this.resolvePack(identifier, maybeSlug);
    const zip = this.getZip(packMeta.kpackPath);
    const imageEntries = zip
      .getEntries()
      .filter((entry) => !entry.isDirectory && isImageEntry(entry.entryName))
      .sort((a, b) => a.entryName.localeCompare(b.entryName, "en"));

    const stickers = imageEntries.map((entry, index) =>
      this.formatStickerEntry(entry, index, options.encoding || "buffer"),
    );

    return {
      ...clone(packMeta),
      stickers,
    };
  }

  async getSticker(identifier, maybeSlugOrFileName, maybeFileNameOrOptions, maybeOptions) {
    const { maybeSlug, options, stickerFileName } = this.normalizeStickerArgs(
      maybeSlugOrFileName,
      maybeFileNameOrOptions,
      maybeOptions,
    );
    const packMeta = await this.resolvePack(identifier, maybeSlug);
    const zip = this.getZip(packMeta.kpackPath);
    const normalizedTarget = normalizeSlashes(stickerFileName);

    const entry = zip
      .getEntries()
      .find((current) => !current.isDirectory && normalizeSlashes(current.entryName) === normalizedTarget);

    if (!entry) {
      throw new Error(`Sticker não encontrada no pack ${packMeta.id}: ${stickerFileName}`);
    }

    return this.formatStickerEntry(entry, null, options.encoding || "buffer");
  }

  async getPackManifest(identifier, maybeSlug) {
    const packMeta = await this.resolvePack(identifier, maybeSlug);
    const zip = this.getZip(packMeta.kpackPath);
    const entry = zip
      .getEntries()
      .find((current) => !current.isDirectory && isManifestEntry(current.entryName));

    if (!entry) {
      return null;
    }

    return JSON.parse(entry.getData().toString("utf8"));
  }

  async hasPack(identifier, maybeSlug) {
    try {
      await this.resolvePack(identifier, maybeSlug);
      return true;
    } catch {
      return false;
    }
  }

  async findPacks(search) {
    const query = String(search || "").trim().toLowerCase();
    if (!query) {
      return [];
    }

    const packs = await this.getAllPacks();
    return packs.filter((pack) => {
      const haystack = [
        pack.id,
        pack.name,
        pack.slug,
        pack.category,
        pack.description,
        ...(Array.isArray(pack.tags) ? pack.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  async resolvePack(identifier, maybeSlug) {
    const packs = await this.getAllPacks();
    const resolved = this.normalizePackLookup(identifier, maybeSlug);

    const pack = packs.find((current) => {
      if (resolved.id) {
        return current.id === resolved.id;
      }

      return current.category === resolved.category && current.slug === resolved.slug;
    });

    if (!pack) {
      const attempted = resolved.id || `${resolved.category}/${resolved.slug}`;
      throw new Error(`Pack não encontrado: ${attempted}`);
    }

    return pack;
  }

  normalizePackLookup(identifier, maybeSlug) {
    if (typeof identifier === "object" && identifier !== null) {
      if (identifier.id) {
        return { id: String(identifier.id) };
      }

      if (identifier.category && identifier.slug) {
        return {
          category: String(identifier.category),
          slug: String(identifier.slug),
        };
      }
    }

    if (typeof maybeSlug === "string") {
      return {
        category: String(identifier),
        slug: maybeSlug,
      };
    }

    const rawValue = String(identifier);

    if (rawValue.includes("/")) {
      const [category, slug] = rawValue.split("/");
      return { category, slug };
    }

    if (rawValue.includes(".")) {
      return { id: rawValue };
    }

    throw new Error(
      "Identificador inválido. Use packId (`anime.killua1`), `categoria/slug` ou `{ category, slug }`.",
    );
  }

  scanPacks() {
    if (!fs.existsSync(this.packsDir)) {
      return [];
    }

    const categories = fs
      .readdirSync(this.packsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "en"));

    const packs = [];

    for (const category of categories) {
      const categoryDir = path.join(this.packsDir, category);
      const files = fs
        .readdirSync(categoryDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && isKpackFile(entry.name))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, "en"));

      for (const fileName of files) {
        const slug = path.basename(fileName, ".kpack");
        const kpackPath = path.join(categoryDir, fileName);
        const manifest = this.readManifestFromKpack(kpackPath);
        const stats = fs.statSync(kpackPath);

        packs.push({
          id: manifest.id || `${category}.${slug}`,
          slug,
          category: manifest.category || category,
          name: manifest.name || slug,
          description: manifest.description || "",
          author: manifest.author || null,
          tags: Array.isArray(manifest.tags) ? manifest.tags : [],
          cover: manifest.cover || null,
          code: manifest.code || null,
          adult: manifest.adult === true,
          fileName,
          fileSize: stats.size,
          kpackPath,
          updatedAt: stats.mtime.toISOString(),
        });
      }
    }

    return packs;
  }

  readConfig() {
    if (!fs.existsSync(this.configPath)) {
      return clone(DEFAULT_CONFIG);
    }

    const raw = fs.readFileSync(this.configPath, "utf8").trim();
    if (!raw) {
      return clone(DEFAULT_CONFIG);
    }

    const parsed = JSON.parse(raw);

    return {
      filters: {
        allowAdult:
          parsed?.filters?.allowAdult === undefined
            ? DEFAULT_CONFIG.filters.allowAdult
            : parsed.filters.allowAdult === true,
        blockedCategories: Array.isArray(parsed?.filters?.blockedCategories)
          ? parsed.filters.blockedCategories.map((item) => String(item))
          : [],
        blockedPackIds: Array.isArray(parsed?.filters?.blockedPackIds)
          ? parsed.filters.blockedPackIds.map((item) => String(item))
          : [],
      },
    };
  }

  isPackAllowed(pack) {
    const config = this.getConfig();
    const blockedCategories = new Set(config.filters.blockedCategories);
    const blockedPackIds = new Set(config.filters.blockedPackIds);

    if (!config.filters.allowAdult && (pack.adult === true || pack.category === "+18")) {
      return false;
    }

    if (blockedCategories.has(pack.category)) {
      return false;
    }

    if (blockedPackIds.has(pack.id)) {
      return false;
    }

    return true;
  }

  readManifestFromKpack(kpackPath) {
    const zip = this.getZip(kpackPath);
    const manifestEntry = zip
      .getEntries()
      .find((entry) => !entry.isDirectory && isManifestEntry(entry.entryName));

    if (!manifestEntry) {
      return {};
    }

    return JSON.parse(manifestEntry.getData().toString("utf8"));
  }

  getZip(kpackPath) {
    const resolvedPath = path.resolve(kpackPath);

    if (!this.zipCache.has(resolvedPath)) {
      this.zipCache.set(resolvedPath, new AdmZip(resolvedPath));
    }

    return this.zipCache.get(resolvedPath);
  }

  formatStickerEntry(entry, index, encoding) {
    const buffer = entry.getData();
    const mimeType = mime.lookup(entry.entryName) || "application/octet-stream";
    const name = path.basename(entry.entryName);
    const base = {
      name,
      path: normalizeSlashes(entry.entryName),
      mimeType,
      size: buffer.length,
    };

    if (typeof index === "number") {
      base.index = index;
    }

    if (encoding === "base64") {
      return {
        ...base,
        data: buffer.toString("base64"),
      };
    }

    return {
      ...base,
      buffer,
    };
  }

  async getRandomPack(category = null) {
    const packs = category ? await this.getPacksByCategory(category) : await this.getAllPacks();
    if (packs.length === 0) {
      return null;
    }

    return clone(packs[Math.floor(Math.random() * packs.length)]);
  }

  async getRandomSticker(identifier, maybeSlugOrOptions, maybeOptions) {
    const pack = await this.getPack(identifier, maybeSlugOrOptions, maybeOptions);
    if (pack.stickers.length === 0) {
      return null;
    }

    return pack.stickers[Math.floor(Math.random() * pack.stickers.length)];
  }

  normalizePackArgs(maybeSlugOrOptions, maybeOptions) {
    if (
      maybeSlugOrOptions &&
      typeof maybeSlugOrOptions === "object" &&
      !Array.isArray(maybeSlugOrOptions)
    ) {
      return {
        maybeSlug: undefined,
        options: maybeSlugOrOptions,
      };
    }

    return {
      maybeSlug: maybeSlugOrOptions,
      options: maybeOptions || {},
    };
  }

  normalizeStickerArgs(maybeSlugOrFileName, maybeFileNameOrOptions, maybeOptions) {
    if (typeof maybeFileNameOrOptions === "string") {
      return {
        maybeSlug: maybeSlugOrFileName,
        stickerFileName: maybeFileNameOrOptions,
        options: maybeOptions || {},
      };
    }

    return {
      maybeSlug: undefined,
      stickerFileName: maybeSlugOrFileName,
      options: maybeFileNameOrOptions || {},
    };
  }
}

module.exports = StickerPackAPI;
