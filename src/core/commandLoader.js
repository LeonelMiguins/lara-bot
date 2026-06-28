const fs = require('fs');
const path = require('path');
const { normalizeCommandDefinition, validateCommandDefinition } = require('./commandContract');

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
  const uniqueCommands = [];
  const seenNames = new Set();

  for (const file of commandFiles) {
    const rawCommand = require(file);
    const command = normalizeCommandDefinition(rawCommand);
    validateCommandDefinition(command, file);

    const scope = path.basename(path.dirname(file));
    command.scope = command.scope || scope;
    command.filePath = file;

    const aliases = [command.name, ...(command.aliases || [])];
    for (const alias of aliases) {
      commandMap.set(alias.toLowerCase(), command);
    }

    if (!seenNames.has(command.name)) {
      seenNames.add(command.name);
      uniqueCommands.push(command);
    }
  }

  commandMap.catalog = uniqueCommands;

  return commandMap;
}

module.exports = {
  loadCommands,
};
