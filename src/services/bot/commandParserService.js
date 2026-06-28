function parseCommandMessage(body, commandPrefix, commandRegistry) {
  const normalizedBody = String(body || '').trim();
  if (!normalizedBody || !normalizedBody.startsWith(commandPrefix)) {
    return null;
  }

  const parts = normalizedBody
    .slice(commandPrefix.length)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return null;
  }

  const commandName = parts.shift().toLowerCase();
  const command = commandRegistry.get(commandName);
  if (!command) {
    return null;
  }

  const args = parts;
  const helpRequested = command.name !== 'help'
    && args.length > 0
    && ['help', 'ajuda'].includes(String(args[args.length - 1]).toLowerCase());

  return {
    body: normalizedBody,
    commandName,
    command,
    args,
    helpRequested,
  };
}

module.exports = {
  parseCommandMessage,
};
