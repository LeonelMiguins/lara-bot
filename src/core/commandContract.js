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
  const examples = ensureArray(command.menuExamples);

  if (!examples.length && command.menuExample) {
    examples.push(command.menuExample);
  }

  if (!examples.length && command.name) {
    examples.push(`#${command.name}`);
  }

  return {
    summary: command.description || '',
    examples,
    notes: [],
  };
}

function normalizeHelp(command) {
  const catalogHelp = helpCatalog[command.name] || {};
  const commandHelp = command.help || {};
  const fallbackHelp = buildDefaultHelp(command);

  return {
    summary: commandHelp.summary || catalogHelp.summary || fallbackHelp.summary,
    examples: ensureArray(
      commandHelp.examples
      || commandHelp.usage
      || catalogHelp.examples
      || catalogHelp.usage
      || fallbackHelp.examples,
    ),
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

  if (!Array.isArray(command.help.examples)) {
    throw new Error(`Comando sem help.examples em ${file}`);
  }

  if (!Array.isArray(command.help.notes)) {
    throw new Error(`Comando sem help.notes em ${file}`);
  }
}

module.exports = {
  normalizeCommandDefinition,
  validateCommandDefinition,
};
