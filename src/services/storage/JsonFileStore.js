const fs = require('fs');
const path = require('path');
const { ensureDirectory } = require('../../utils/wweb');

class JsonFileStore {
  constructor(baseDir) {
    this.baseDir = path.resolve(baseDir);
    ensureDirectory(this.baseDir);
  }

  resolvePath(fileName) {
    return path.resolve(this.baseDir, fileName);
  }

  exists(fileName) {
    return fs.existsSync(this.resolvePath(fileName));
  }

  read(fileName) {
    const filePath = this.resolvePath(fileName);
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }

  write(fileName, data) {
    const filePath = this.resolvePath(fileName);
    ensureDirectory(this.baseDir);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return data;
  }

  update(fileName, updater) {
    const current = this.read(fileName);
    const next = typeof updater === 'function' ? updater(current) : current;
    return this.write(fileName, next);
  }
}

module.exports = JsonFileStore;
