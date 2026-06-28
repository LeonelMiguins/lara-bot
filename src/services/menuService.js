const config = require('../config/config');

const FEATURE_LABELS = {
  welcome: 'Boas-vindas automáticas',
  farewell: 'Mensagem automática quando um membro sai',
  antiLink: 'Anti-link para grupos, apostas e conteúdo adulto',
  antiFlood: 'Anti-flood para repetição',
};

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
    return command.menuExamples.map(normalizeExample).filter(Boolean);
  }

  if (typeof command.menuExample === 'string' && command.menuExample.trim()) {
    return [normalizeExample(command.menuExample)];
  }

  return [`${commandPrefix}${command.name}`];
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
      if (senderIsOwner) {
        grouped.owner.push(command);
      }
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
  const grouped = groupCommands({ senderIsOwner });
  const lines = [`*${config.botName}*`, ''];

  if (grouped.admin.length) {
    lines.push('*Administracao*');
    for (const command of sortCommands(grouped.admin)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
    lines.push('');
  }

  lines.push('*Automaticos*');
  lines.push(`🟢/🔴 Controle por ${commandPrefix}modulos`);
  for (const featureName of Object.keys(config.features || {})) {
    lines.push(FEATURE_LABELS[featureName] || featureName);
  }
  lines.push('');

  if (grouped.user.length) {
    lines.push('*Usuarios*');
    for (const command of sortCommands(grouped.user)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
    lines.push('');
  }

  if (grouped.owner.length) {
    lines.push('*Dono*');
    for (const command of sortCommands(grouped.owner)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
  } else if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
}

module.exports = {
  buildMenuText,
  getCommandCatalog,
  setCommandCatalog,
};
