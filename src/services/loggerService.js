const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const { ensureDirectory, idToHandle } = require('../utils/wweb');

const LOG_FILE_NAME = 'bot.log';

function getLogFilePath() {
  return path.resolve(config.paths.logDir, LOG_FILE_NAME);
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

function write(level, event, meta = {}) {
  ensureDirectory(config.paths.logDir);

  const timestamp = new Date().toISOString();
  const line = [timestamp, level.toUpperCase(), event, serializeMeta(meta)]
    .filter(Boolean)
    .join(' ');

  fs.appendFileSync(getLogFilePath(), `${line}\n`, 'utf8');

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

module.exports = {
  buildMessageMeta,
  commandCompleted,
  commandFailed,
  commandReceived,
  commandRejected,
  error,
  getLogFilePath,
  groupEvent,
  info,
  runtimeError,
  runtimeEvent,
  runtimeWarn,
  warn,
};
