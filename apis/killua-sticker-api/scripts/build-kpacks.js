const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const sharp = require("sharp");
const { ZipArchive } = require("archiver");
const ffmpegStatic = require("ffmpeg-static");

const ROOT_DIR = process.cwd();
const SOURCE_ROOT = path.join(ROOT_DIR, "packs_work");
const OUTPUT_ROOT = path.join(ROOT_DIR, "packs");
const TEMP_ROOT = path.join(ROOT_DIR, ".tmp", "build-kpacks");

const SOURCE_IMAGE_EXTENSIONS = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".apng",
]);

const IMAGE_OUTPUT_EXTENSION = ".webp";
const MANIFEST_FILES = new Set(["data.json", "pack-info.json"]);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function rimrafIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function removeDirIfEmpty(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  if (!fs.statSync(targetPath).isDirectory()) {
    return;
  }

  if (fs.readdirSync(targetPath).length === 0) {
    fs.rmdirSync(targetPath);
  }
}

function listPackDirectories(baseDir) {
  const discovered = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
    const childDirs = entries.filter((entry) => entry.isDirectory());

    const hasPackImages = files.some((fileName) =>
      SOURCE_IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()),
    );

    if (hasPackImages) {
      discovered.push(currentDir);
      return;
    }

    for (const childDir of childDirs) {
      walk(path.join(currentDir, childDir.name));
    }
  }

  walk(baseDir);
  return discovered.sort();
}

async function detectAnimatedImage(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".gif" || extension === ".apng") {
    return true;
  }

  try {
    const metadata = await sharp(filePath, { animated: true }).metadata();
    return typeof metadata.pages === "number" && metadata.pages > 1;
  } catch {
    return false;
  }
}

async function convertStaticImage(inputPath, outputPath) {
  await sharp(inputPath)
    .webp({
      quality: 90,
      effort: 6,
      alphaQuality: 100,
    })
    .toFile(outputPath);
}

async function convertAnimatedImage(inputPath, outputPath) {
  await new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-i",
      inputPath,
      "-vcodec",
      "libwebp",
      "-compression_level",
      "6",
      "-q:v",
      "80",
      "-preset",
      "picture",
      "-loop",
      "0",
      "-an",
      "-vsync",
      "0",
      outputPath,
    ];

    const process = spawn(ffmpegStatic, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";

    process.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Falha ao converter animação com ffmpeg (code ${code}): ${stderr}`));
    });
  });
}

async function convertImageToWebp(inputPath, outputPath) {
  const animated = await detectAnimatedImage(inputPath);

  if (animated) {
    await convertAnimatedImage(inputPath, outputPath);
    return { animated: true };
  }

  await convertStaticImage(inputPath, outputPath);
  return { animated: false };
}

function copyFile(inputPath, outputPath) {
  ensureDir(path.dirname(outputPath));
  fs.copyFileSync(inputPath, outputPath);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + os.EOL, "utf8");
}

function buildRenamedImageMap(fileNames) {
  const renameMap = new Map();
  const usedNames = new Map();

  for (const fileName of fileNames) {
    const extension = path.extname(fileName).toLowerCase();
    if (!SOURCE_IMAGE_EXTENSIONS.has(extension)) {
      continue;
    }

    const targetName = `${path.basename(fileName, extension)}${IMAGE_OUTPUT_EXTENSION}`;
    const previousSource = usedNames.get(targetName);

    if (previousSource && previousSource !== fileName) {
      throw new Error(
        `Conflito de nome ao converter para WEBP: "${previousSource}" e "${fileName}" virariam "${targetName}".`,
      );
    }

    renameMap.set(fileName, targetName);
    usedNames.set(targetName, fileName);
  }

  return renameMap;
}

function patchManifest(manifest, renameMap) {
  if (!manifest || typeof manifest !== "object") {
    return manifest;
  }

  const cloned = JSON.parse(JSON.stringify(manifest));

  if (typeof cloned.cover === "string" && renameMap.has(cloned.cover)) {
    cloned.cover = renameMap.get(cloned.cover);
  }

  if (Array.isArray(cloned.stickers)) {
    cloned.stickers = cloned.stickers.map((sticker) => {
      if (typeof sticker === "string") {
        return renameMap.get(sticker) || sticker;
      }

      if (sticker && typeof sticker === "object" && typeof sticker.file === "string") {
        return {
          ...sticker,
          file: renameMap.get(sticker.file) || sticker.file,
        };
      }

      return sticker;
    });
  }

  return cloned;
}

async function archiveDirectoryToKpack(sourceDir, outputKpackPath) {
  const tempZipPath = `${outputKpackPath}.zip`;

  ensureDir(path.dirname(outputKpackPath));

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(tempZipPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });

  if (fs.existsSync(outputKpackPath)) {
    fs.rmSync(outputKpackPath, { force: true });
  }

  fs.renameSync(tempZipPath, outputKpackPath);
}

async function processPack(packDir) {
  const relativePackDir = path.relative(SOURCE_ROOT, packDir);
  const packParts = relativePackDir.split(path.sep);

  if (packParts.length < 2) {
    throw new Error(`Pack fora do formato esperado categoria/slug: ${relativePackDir}`);
  }

  const category = packParts[0];
  const packSlug = packParts[packParts.length - 1];
  const buildDir = path.join(TEMP_ROOT, relativePackDir);
  const outputCategoryDir = path.join(OUTPUT_ROOT, category);
  const outputKpackPath = path.join(outputCategoryDir, `${packSlug}.kpack`);

  rimrafIfExists(buildDir);
  ensureDir(buildDir);
  ensureDir(outputCategoryDir);

  const entries = fs.readdirSync(packDir, { withFileTypes: true });
  const fileNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const renameMap = buildRenamedImageMap(fileNames);

  for (const fileName of fileNames) {
    const sourcePath = path.join(packDir, fileName);
    const extension = path.extname(fileName).toLowerCase();

    if (SOURCE_IMAGE_EXTENSIONS.has(extension)) {
      const outputName = renameMap.get(fileName);
      const buildPath = path.join(buildDir, outputName);

      if (extension === IMAGE_OUTPUT_EXTENSION) {
        copyFile(sourcePath, buildPath);
      } else {
        await convertImageToWebp(sourcePath, buildPath);
      }

      continue;
    }

    if (MANIFEST_FILES.has(fileName)) {
      const manifest = readJsonIfExists(sourcePath);
      const patched = patchManifest(manifest, renameMap);
      writeJson(path.join(buildDir, fileName), patched);
      continue;
    }

    copyFile(sourcePath, path.join(buildDir, fileName));
  }

  await archiveDirectoryToKpack(buildDir, outputKpackPath);

  return {
    category,
    packSlug,
    outputKpackPath,
  };
}

async function main() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    throw new Error(`Pasta de origem não encontrada: ${SOURCE_ROOT}`);
  }

  rimrafIfExists(TEMP_ROOT);
  ensureDir(TEMP_ROOT);
  ensureDir(OUTPUT_ROOT);

  const packDirs = listPackDirectories(SOURCE_ROOT);

  if (packDirs.length === 0) {
    console.log("Nenhum pack encontrado em packs_work.");
    return;
  }

  const results = [];

  for (const packDir of packDirs) {
    const result = await processPack(packDir);
    results.push(result);
    console.log(`kpack gerado: ${path.relative(ROOT_DIR, result.outputKpackPath)}`);
  }

  console.log(`Concluído: ${results.length} packs processados.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  rimrafIfExists(TEMP_ROOT);
  removeDirIfEmpty(path.dirname(TEMP_ROOT));
});
