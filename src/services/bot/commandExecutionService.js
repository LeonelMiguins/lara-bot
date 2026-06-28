const logger = require('../loggerService');
const { sendCommandHelp } = require('../commandHelpService');

async function reactToCommandMessage(message, context) {
  if (!context?.isGroup || !context?.groupSettings?.features?.commandReaction) {
    return;
  }

  try {
    await message.react('👍');
  } catch (error) {
    logger.runtimeWarn('command.reaction_failed', logger.buildMessageMeta(context, {
      errorMessage: error?.message || String(error),
    }));
  }
}

async function maybeSendCommandHelp({ client, chatId, command, commandPrefix, helpRequested }) {
  if (!helpRequested) {
    return false;
  }

  await sendCommandHelp({
    client,
    chatId,
    command,
    commandPrefix,
  });

  return true;
}

async function executeCommand({ client, message, command, args, body, context, commandRegistry }) {
  await reactToCommandMessage(message, context);
  logger.commandReceived(command.name, args, context);

  const startedAt = Date.now();
  await command.execute({
    client,
    message,
    args,
    body,
    commandRegistry,
    ...context,
  });

  return {
    durationMs: Date.now() - startedAt,
  };
}

module.exports = {
  executeCommand,
  maybeSendCommandHelp,
};
