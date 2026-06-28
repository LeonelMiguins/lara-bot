const helpCatalog = require('../config/command-help.json');

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value === undefined || value === null || value === '') {
    return [];
  }

  return [value];
}

function buildDefaultHelp(command) {
  const usage = ensureArray(command.menuExamples);

  if (!usage.length && command.menuExample) {
    usage.push(command.menuExample);
  }

  if (!usage.length && command.name) {
    usage.push(`#${command.name}`);
  }

  return {
    summary: command.description || '',
    usage,
    notes: [],
  };
}

function normalizeHelp(command) {
  const catalogHelp = helpCatalog[command.name] || {};
  const commandHelp = command.help || {};
  const fallbackHelp = buildDefaultHelp(command);

  return {
    summary: commandHelp.summary || catalogHelp.summary || fallbackHelp.summary,
    usage: ensureArray(commandHelp.usage || catalogHelp.usage || fallbackHelp.usage),
    notes: ensureArray(commandHelp.notes || catalogHelp.notes || fallbackHelp.notes),
  };
}

function normalizeCommandDefinition(command) {
  const normalizedAliases = ensureArray(command.aliases).map((alias) => String(alias).toLowerCase());
  const normalizedMenuExamples = ensureArray(command.menuExamples);
  const normalizedMenuExample = command.menuExample || normalizedMenuExamples[0] || `#${command.name}`;

  return {
    ...command,
    aliases: normalizedAliases,
    description: String(command.description || '').trim(),
    menuExample: String(normalizedMenuExample || '').trim(),
    menuExamples: normalizedMenuExamples.length ? normalizedMenuExamples : [normalizedMenuExample],
    help: normalizeHelp({
      ...command,
      aliases: normalizedAliases,
      menuExample: normalizedMenuExample,
      menuExamples: normalizedMenuExamples.length ? normalizedMenuExamples : [normalizedMenuExample],
    }),
    groupOnly: Boolean(command.groupOnly),
    adminOnly: Boolean(command.adminOnly),
    ownerOnly: Boolean(command.ownerOnly),
  };
}

function validateCommandDefinition(command, file) {
  if (!command?.name || typeof command.execute !== 'function') {
    throw new Error(`Comando invalido em ${file}`);
  }

  if (!command.description) {
    throw new Error(`Comando sem description em ${file}`);
  }

  if (!command.menuExample) {
    throw new Error(`Comando sem menuExample em ${file}`);
  }

  if (!command.help?.summary) {
    throw new Error(`Comando sem help.summary em ${file}`);
  }
}

module.exports = {
  normalizeCommandDefinition,
  validateCommandDefinition,
};
