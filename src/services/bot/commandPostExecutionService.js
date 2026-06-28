const logger = require('../loggerService');
const ownerNotifications = require('../ownerNotificationService');
const { phraseError } = require('../../utils/respond');

async function finalizeCommandExecution({ client, commandName, context, durationMs }) {
  logger.commandCompleted(commandName, durationMs, context);

  try {
    await ownerNotifications.notifyCommandExecuted(client, commandName, context, durationMs);
  } catch (notificationError) {
    logger.runtimeError('owner_notification.command_failed', notificationError, logger.buildMessageMeta(context, {
      command: commandName,
    }));
  }
}

async function handleCommandFailure({ message, commandName, error, context }) {
  logger.commandFailed(commandName, error, context);

  try {
    await message.reply(
      phraseError('common.execution_failed'),
    );
  } catch {}
}

module.exports = {
  finalizeCommandExecution,
  handleCommandFailure,
};
