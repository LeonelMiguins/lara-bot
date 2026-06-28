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
  const menuStyle = config.messageStyle?.menu || {};
  const commandLinePrefix = menuStyle.commandPrefix || '⤷';
  const wrapCommandInCode = menuStyle.wrapCommandInCode !== false;
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
      .map((example) => `${commandLinePrefix} ${wrapCommandInCode ? `\`${example}\`` : example}`);
  }

  if (typeof command.menuExample === 'string' && command.menuExample.trim()) {
    const example = normalizeExample(command.menuExample);
    return [`${commandLinePrefix} ${wrapCommandInCode ? `\`${example}\`` : example}`];
  }

  const fallbackCommand = `${commandPrefix}${command.name}`;
  return [`${commandLinePrefix} ${wrapCommandInCode ? `\`${fallbackCommand}\`` : fallbackCommand}`];
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
  const messageStyle = config.messageStyle || {};
  const menuStyle = messageStyle.menu || {};
  const headerLeft = messageStyle.header?.left || '╭━━〔';
  const headerRight = messageStyle.header?.right || '〕';
  const footer = messageStyle.header?.footer || '╰━━━━━━━━━━━━━━━━━━';
  const sectionPrefix = messageStyle.sections?.prefix || '→';
  const headerLabel = menuStyle.headerLabel || 'LARA BOT MENU';
  const commandLinePrefix = menuStyle.commandPrefix || '⤷';
  const wrapCommandInCode = menuStyle.wrapCommandInCode !== false;
  const grouped = groupCommands({ senderIsOwner });
  const lines = [`${headerLeft} ${headerLabel} ${headerRight}`, ''];

  if (grouped.admin.length) {
    lines.push(`${sectionPrefix} *Administracao:*`);
    for (const command of sortCommands(grouped.admin)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
    lines.push('');
  }

  lines.push(`${sectionPrefix} *Automaticos:*`);
  lines.push(`${commandLinePrefix} ${wrapCommandInCode ? `\`🟢/🔴 Controle por ${commandPrefix}modulos\`` : `🟢/🔴 Controle por ${commandPrefix}modulos`}`);
  for (const featureName of Object.keys(config.features || {})) {
    lines.push(`${commandLinePrefix} ${FEATURE_LABELS[featureName] || featureName}`);
  }
  lines.push('');

  if (grouped.user.length) {
    lines.push(`${sectionPrefix} *Usuarios:*`);
    for (const command of sortCommands(grouped.user)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
    lines.push('');
  }

  if (grouped.owner.length) {
    lines.push(`${sectionPrefix} *Dono:*`);
    for (const command of sortCommands(grouped.owner)) {
      lines.push(...formatUsage(command, commandPrefix));
    }
  } else if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  lines.push(footer);

  return lines.join('\n');
}

module.exports = {
  buildMenuText,
  getCommandCatalog,
  setCommandCatalog,
};
