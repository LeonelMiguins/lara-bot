const { commandPanel, createSection } = require('../utils/respond');
const { getPhrase } = require('./messagePhraseService');

function getScopeLabel(command) {
  if (command.ownerOnly) {
    return getPhrase('help.scope_owner_private');
  }

  if (command.groupOnly) {
    return getPhrase('help.scope_group');
  }

  return getPhrase('help.scope_group_and_private');
}

function getPermissionLabel(command) {
  if (command.ownerOnly) {
    return getPhrase('help.permission_owner');
  }

  if (command.adminOnly) {
    return getPhrase('help.permission_admin');
  }

  return getPhrase('help.permission_anyone');
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
    createSection(getPhrase('labels.summary'), [
      helpEntry?.summary || command.description,
    ]),
    createSection(getPhrase('labels.permission'), [
      getPermissionLabel(command),
    ]),
    createSection(getPhrase('labels.usage_scope'), [
      getScopeLabel(command),
    ]),
  ];

  if (normalizedExamples.length) {
    sections.push(createSection(getPhrase('labels.examples'), normalizedExamples));
  }

  if (Array.isArray(helpEntry?.notes) && helpEntry.notes.length) {
    sections.push(createSection(getPhrase('labels.notes'), helpEntry.notes));
  }

  return commandPanel(getPhrase('help.title', { command_name: command.name }), {
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
