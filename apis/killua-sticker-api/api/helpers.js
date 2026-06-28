const path = require("path");
const mime = require("mime-types");
const { MANIFEST_NAMES } = require("./constants");

function normalizeSlashes(value) {
  return String(value).replace(/\\/g, "/");
}

function isKpackFile(fileName) {
  return path.extname(fileName).toLowerCase() === ".kpack";
}

function isManifestEntry(entryName) {
  return MANIFEST_NAMES.includes(path.basename(entryName).toLowerCase());
}

function isImageEntry(entryName) {
  const mimeType = mime.lookup(entryName);
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = {
  normalizeSlashes,
  isKpackFile,
  isManifestEntry,
  isImageEntry,
  clone,
};
