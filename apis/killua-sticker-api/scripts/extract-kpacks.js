const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const ROOT_DIR = process.cwd();
const SOURCE_ROOT = path.join(ROOT_DIR, "packs");
const TARGET_ROOT = path.join(ROOT_DIR, "packs_work");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function rimrafIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function isKpackFile(fileName) {
  return path.extname(fileName).toLowerCase() === ".kpack";
}

function listKpacks(baseDir) {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const categories = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));

  const kpacks = [];

  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    const files = fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && isKpackFile(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "en"));

    for (const fileName of files) {
      kpacks.push({
        category,
        slug: path.basename(fileName, ".kpack"),
        sourcePath: path.join(categoryDir, fileName),
      });
    }
  }

  return kpacks;
}

function extractKpack(sourcePath, targetDir) {
  const zip = new AdmZip(sourcePath);
  const entries = zip.getEntries();

  rimrafIfExists(targetDir);
  ensureDir(targetDir);

  for (const entry of entries) {
    const destinationPath = path.join(targetDir, entry.entryName);

    if (entry.isDirectory) {
      ensureDir(destinationPath);
      continue;
    }

    ensureDir(path.dirname(destinationPath));
    fs.writeFileSync(destinationPath, entry.getData());
  }
}

function main() {
  const kpacks = listKpacks(SOURCE_ROOT);

  if (kpacks.length === 0) {
    console.log("Nenhum arquivo .kpack encontrado em packs.");
    return;
  }

  ensureDir(TARGET_ROOT);

  for (const pack of kpacks) {
    const targetDir = path.join(TARGET_ROOT, pack.category, pack.slug);
    extractKpack(pack.sourcePath, targetDir);
    console.log(`extraido: packs_work\\${pack.category}\\${pack.slug}`);
  }

  console.log(`Concluido: ${kpacks.length} packs extraidos para packs_work.`);
}

main();
