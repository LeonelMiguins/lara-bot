const fs = require("fs");
const path = require("path");
const { createStickerAPI } = require("../api");

const ROOT_DIR = process.cwd();
const HTML_DIR = path.join(ROOT_DIR, "html");
const COVERS_DIR = path.join(HTML_DIR, "covers");
const CATALOG_PATH = path.join(HTML_DIR, "catalog.json");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function rimrafIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function slugifyFilePart(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function main() {
  const api = createStickerAPI();
  const packs = await api.getAllPacks();

  ensureDir(HTML_DIR);
  rimrafIfExists(COVERS_DIR);
  ensureDir(COVERS_DIR);

  const catalog = [];

  for (const pack of packs) {
    const coverFileName = pack.cover || null;
    let coverUrl = null;
    let stickerCount = 0;

    if (coverFileName) {
      const cover = await api.getSticker(pack.id, coverFileName);
      const extension = path.extname(cover.name) || ".webp";
      const targetFileName = `${slugifyFilePart(pack.category)}--${slugifyFilePart(pack.slug)}${extension}`;
      const targetPath = path.join(COVERS_DIR, targetFileName);

      fs.writeFileSync(targetPath, cover.buffer);
      coverUrl = `./covers/${targetFileName}`;
    }

    const fullPack = await api.getPack(pack.id);
    stickerCount = fullPack.stickers.length;

    catalog.push({
      id: pack.id,
      slug: pack.slug,
      category: pack.category,
      name: pack.name,
      description: pack.description,
      author: pack.author,
      tags: pack.tags,
      code: pack.code,
      adult: pack.adult === true,
      stickerCount,
      coverUrl,
      updatedAt: pack.updatedAt,
    });
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  console.log(`catalogo gerado: ${path.relative(ROOT_DIR, CATALOG_PATH)}`);
  console.log(`capas geradas: ${catalog.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
