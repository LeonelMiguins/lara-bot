const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { loadOwnerSettings } = require('./ownerSettingsService');
const { ensureDirectory, idToHandle } = require('../utils/wweb');
const { nowLabel } = require('../utils/text');

const LOG_FILE_NAME = 'bot.log';

function getLogFilePath() {
  return path.resolve(config.paths.logDir, LOG_FILE_NAME);
}

function logsEnabled() {
  return Boolean(loadOwnerSettings().logs?.enabled);
}

function serializeMeta(meta = {}) {
  const entries = Object.entries(meta)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const normalizedValue = Array.isArray(value) ? value.join(',') : String(value);
      return `${key}=${JSON.stringify(normalizedValue)}`;
    });

  return entries.join(' ');
}

function formatLine(level, event, meta = {}) {
  const timestamp = new Date().toISOString();
  return [timestamp, level.toUpperCase(), event, serializeMeta(meta)]
    .filter(Boolean)
    .join(' ');
}

function writeToConsole(level, line) {
  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

function writeToFile(line) {
  ensureDirectory(config.paths.logDir);
  fs.appendFileSync(getLogFilePath(), `${line}\n`, 'utf8');
}

function write(level, event, meta = {}, options = {}) {
  const {
    requiresEnabled = true,
    forceConsole = false,
    forceFile = false,
  } = options;

  if (requiresEnabled && !logsEnabled()) {
    return;
  }

  const line = formatLine(level, event, meta);
  const shouldWriteFile = forceFile || !requiresEnabled || logsEnabled();
  const shouldWriteConsole = forceConsole || !requiresEnabled || logsEnabled();

  if (shouldWriteFile) {
    writeToFile(line);
  }

  if (shouldWriteConsole) {
    writeToConsole(level, line);
  }
}

function buildMessageMeta(context = {}, extra = {}) {
  return {
    chatId: context.chatId,
    chatName: context.chatName,
    group: context.isGroup ? 'yes' : 'no',
    senderId: context.senderId,
    sender: context.senderId ? idToHandle(context.senderId) : undefined,
    botIsAdmin: context.botIsAdmin,
    senderIsAdmin: context.senderIsAdmin,
    ...extra,
  };
}

function info(event, meta) {
  write('info', event, meta);
}

function warn(event, meta) {
  write('warn', event, meta);
}

function error(event, err, meta = {}) {
  write('error', event, {
    ...meta,
    errorName: err?.name,
    errorMessage: err?.message || String(err),
  });
}

function commandReceived(commandName, args, context) {
  info('command.received', buildMessageMeta(context, {
    command: commandName,
    argsCount: args.length,
    args: args,
  }));
}

function commandCompleted(commandName, durationMs, context) {
  info('command.completed', buildMessageMeta(context, {
    command: commandName,
    durationMs,
  }));
}

function commandRejected(commandName, reason, context, extra = {}) {
  warn('command.rejected', buildMessageMeta(context, {
    command: commandName,
    reason,
    ...extra,
  }));
}

function commandFailed(commandName, err, context) {
  error('command.failed', err, buildMessageMeta(context, {
    command: commandName,
  }));
}

function groupEvent(event, context, extra = {}) {
  info(event, buildMessageMeta(context, extra));
}

function runtimeEvent(event, meta = {}) {
  info(event, meta);
}

function runtimeWarn(event, meta = {}) {
  warn(event, meta);
}

function runtimeError(event, err, meta = {}) {
  error(event, err, meta);
}

function connectionEvent(event, meta = {}) {
  write('info', event, meta, {
    requiresEnabled: false,
    forceConsole: true,
    forceFile: false,
  });
}

function connectionWarn(event, meta = {}) {
  write('warn', event, meta, {
    requiresEnabled: false,
    forceConsole: true,
    forceFile: false,
  });
}

function connectionError(event, err, meta = {}) {
  write('error', event, {
    ...meta,
    errorName: err?.name,
    errorMessage: err?.message || String(err),
  }, {
    requiresEnabled: false,
    forceConsole: true,
    forceFile: false,
  });
}

function connectionPanel(title, lines = [], options = {}) {
  const {
    level = 'info',
  } = options;
  const header = `╭━━〔 ${config.botName.toUpperCase()} | CONEXAO 〕`;
  const bodyLines = Array.isArray(lines) ? lines : [lines];
  const panelLines = [
    `${nowLabel()} ${header}`,
    title ? `┃ ${title}` : '┃',
    '┃',
    ...bodyLines
      .map((line) => String(line || '').trim())
      .filter(Boolean)
      .map((line) => `┃ ${line}`),
    '╰━━━━━━━━━━━━━━━━━━',
  ];

  const output = panelLines.join('\n');

  if (level === 'error') {
    console.error(output);
    return;
  }

  if (level === 'warn') {
    console.warn(output);
    return;
  }

  console.log(output);
}

module.exports = {
  buildMessageMeta,
  commandCompleted,
  commandFailed,
  commandReceived,
  commandRejected,
  connectionError,
  connectionEvent,
  connectionPanel,
  connectionWarn,
  error,
  getLogFilePath,
  groupEvent,
  info,
  logsEnabled,
  runtimeError,
  runtimeEvent,
  runtimeWarn,
  warn,
};
