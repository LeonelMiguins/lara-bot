const config = require('../config/config');
const {
  renderCabecalho,
  renderCommand,
  renderRodape,
  renderTitle,
} = require('./messageRenderService');

let commandCatalog = [];

function setCommandCatalog(commands) {
  commandCatalog = Array.isArray(commands) ? [...commands] : [];
}

function getCommandCatalog() {
  return [...commandCatalog];
}

function formatUsage(command, commandPrefix) {
  const normalizeExample = (example) => {
    const value = String(example || '').trim();
    if (!value) {
      return '';
    }

    if (value.startsWith('#')) {
      return `${commandPrefix}${value.slice(1)}`;
    }

    return value;
  };

  if (Array.isArray(command.menuExamples) && command.menuExamples.length) {
    return command.menuExamples
      .map(normalizeExample)
      .filter(Boolean)
      .map((example) => renderCommand(example));
  }

  if (typeof command.menuExample === 'string' && command.menuExample.trim()) {
    const example = normalizeExample(command.menuExample);
    return [renderCommand(example)];
  }

  const fallbackCommand = `${commandPrefix}${command.name}`;
  return [renderCommand(fallbackCommand)];
}

function groupCommands({ senderIsOwner }) {
  const grouped = {
    admin: [],
    user: [],
    owner: [],
  };

  for (const command of commandCatalog) {
    if (command.name === 'menu') {
      grouped.user.push(command);
      continue;
    }

    if (command.scope === 'owner') {
      grouped.owner.push(command);
      continue;
    }

    if (command.scope === 'admin') {
      grouped.admin.push(command);
      continue;
    }

    grouped.user.push(command);
  }

  return grouped;
}

function sortCommands(commands) {
  return [...commands].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

function buildMenuText({ senderIsOwner = false, commandPrefix = config.prefix }) {
  const menuStyle = config.messageStyle?.menu || {};
  const headerLabel = menuStyle.headerLabel || 'LARA BOT MENU';
  const grouped = groupCommands({ senderIsOwner });
  const lines = [renderCabecalho({ label: headerLabel }), ''];

  if (grouped.admin.length) {
    lines.push(renderTitle('Administracao'));
    for (const command of sortCommands(grouped.admin)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
    lines.push('');
  }

  lines.push(renderTitle('Modulos Automaticos'));
  lines.push(renderCommand(`${commandPrefix}modulos`));
  lines.push('');

  if (grouped.user.length) {
    lines.push(renderTitle('Usuarios'));
    for (const command of sortCommands(grouped.user)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
    lines.push('');
  }

  if (grouped.owner.length) {
    lines.push(renderTitle('Dono'));
    for (const command of sortCommands(grouped.owner)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
  } else if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  lines.push(renderRodape());

  return lines.join('\n');
}

module.exports = {
  buildMenuText,
  getCommandCatalog,
  setCommandCatalog,
};
