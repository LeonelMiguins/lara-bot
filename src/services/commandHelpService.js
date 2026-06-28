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
  const usage = Array.isArray(helpEntry?.usage)
    ? helpEntry.usage
    : [helpEntry?.usage || command?.menuExample].filter(Boolean);
  const normalizedUsage = usage
    .map((entry) => normalizeUsage(entry, commandPrefix))
    .filter(Boolean)
    .map((entry) => `⤷ \`${entry}\``);

  const sections = [
    createSection('Comando', [
      `Nome: ${command.name}`,
      `Permissao: ${getPermissionLabel(command)}`,
      `Uso: ${getScopeLabel(command)}`,
    ]),
  ];

  if (helpEntry?.summary || command?.description) {
    sections.push(createSection('Para que serve', [
      helpEntry?.summary || command.description,
    ]));
  }

  if (normalizedUsage.length) {
    sections.push(createSection('Como usar', normalizedUsage));
  }

  if (Array.isArray(helpEntry?.notes) && helpEntry.notes.length) {
    sections.push(createSection('Observacoes', helpEntry.notes));
  }

  return commandPanel(`Ajuda do comando ${command.name}`, {
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
