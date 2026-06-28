const config = require('../config/config');
const JsonFileStore = require('./storage/JsonFileStore');

const store = new JsonFileStore(config.paths.systemDataDir);
const FILE_NAME = 'owner-settings.json';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDefaultOwnerSettings() {
  return {
    prefix: config.prefix,
    logs: {
      enabled: false,
    },
    notifications: {
      enabled: false,
      commandEvents: true,
      moderationEvents: true,
    },
  };
}

function normalizeOwnerSettings(data = {}) {
  const defaults = createDefaultOwnerSettings();

  return {
    ...defaults,
    ...data,
    prefix: typeof data.prefix === 'string' && data.prefix.trim() ? data.prefix.trim() : defaults.prefix,
    logs: {
      ...defaults.logs,
      ...(data.logs || {}),
    },
    notifications: {
      ...defaults.notifications,
      ...(data.notifications || {}),
    },
  };
}

function saveOwnerSettings(data) {
  return store.write(FILE_NAME, normalizeOwnerSettings(data));
}

function loadOwnerSettings() {
  if (!store.exists(FILE_NAME)) {
    return saveOwnerSettings(createDefaultOwnerSettings());
  }

  try {
    const parsed = store.read(FILE_NAME);
    const normalized = normalizeOwnerSettings(parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      return saveOwnerSettings(normalized);
    }

    return normalized;
  } catch {
    return saveOwnerSettings(createDefaultOwnerSettings());
  }
}

function updateOwnerSettings(updater) {
  const current = loadOwnerSettings();
  const updated = typeof updater === 'function' ? updater(clone(current)) : current;
  return saveOwnerSettings(updated);
}

function setOwnerNotificationsEnabled(enabled) {
  return updateOwnerSettings((current) => {
    current.notifications.enabled = Boolean(enabled);
    return current;
  });
}

function setOwnerLogsEnabled(enabled) {
  return updateOwnerSettings((current) => {
    current.logs.enabled = Boolean(enabled);
    return current;
  });
}

module.exports = {
  createDefaultOwnerSettings,
  loadOwnerSettings,
  saveOwnerSettings,
  setOwnerLogsEnabled,
  setOwnerNotificationsEnabled,
  updateOwnerSettings,
};
