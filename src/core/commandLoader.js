const fs = require('fs');
const path = require('path');

function walk(dirPath, files = []) {
  for (const entry of fs.readdirSync(dirPath)) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function loadCommands(rootDir) {
  const commandMap = new Map();
  const commandFiles = walk(rootDir);

  for (const file of commandFiles) {
    const command = require(file);
    if (!command?.name || typeof command.execute !== 'function') {
      throw new Error(`Comando invalido em ${file}`);
    }

    const aliases = [command.name, ...(command.aliases || [])];
    for (const alias of aliases) {
      commandMap.set(alias.toLowerCase(), command);
    }
  }

  return commandMap;
}

module.exports = {
  loadCommands,
};
