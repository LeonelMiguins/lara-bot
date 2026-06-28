const { commandPanel, createSection } = require('../utils/respond');

function getScopeLabel(command) {
  if (command.ownerOnly) {
    return 'Privado do dono';
  }

  if (command.groupOnly) {
    return 'Grupo';
  }

  return 'Grupo e privado';
}

function getPermissionLabel(command) {
  if (command.ownerOnly) {
    return 'Dono do bot';
  }

  if (command.adminOnly) {
    return 'Administradores';
  }

  return 'Qualquer membro';
}

function normalizeUsage(example, commandPrefix) {
  const value = String(example || '').trim();
  if (!value) {
    return '';
  }

  if (value.startsWith('#')) {
    return `${commandPrefix}${value.slice(1)}`;
  }

  return value;
}

function getHelpEntry(command) {
  return command?.help || null;
}

function buildHelpMessage(command, commandPrefix) {
  const helpEntry = getHelpEntry(command);
  const examples = Array.isArray(helpEntry?.examples)
    ? helpEntry.examples
    : [helpEntry?.examples || helpEntry?.usage || command?.menuExample].filter(Boolean);
  const normalizedExamples = examples
    .map((entry) => normalizeUsage(entry, commandPrefix))
    .filter(Boolean)
    .map((entry) => `⤷ \`${entry}\``);

  const sections = [
    createSection('Resumo', [
      helpEntry?.summary || command.description,
    ]),
    createSection('Permissao', [
      getPermissionLabel(command),
    ]),
    createSection('Local de uso', [
      getScopeLabel(command),
    ]),
  ];

  if (normalizedExamples.length) {
    sections.push(createSection('Exemplos', normalizedExamples));
  }

  if (Array.isArray(helpEntry?.notes) && helpEntry.notes.length) {
    sections.push(createSection('Observacoes', helpEntry.notes));
  }

  return commandPanel(`Ajuda: ${command.name}`, {
    sections,
  });
}

async function sendCommandHelp({ client, chatId, command, commandPrefix }) {
  await client.sendMessage(chatId, buildHelpMessage(command, commandPrefix));
}

module.exports = {
  buildHelpMessage,
  getHelpEntry,
  sendCommandHelp,
};
