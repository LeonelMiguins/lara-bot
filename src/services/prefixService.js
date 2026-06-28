const config = require('../config/config');
const {
  loadGroupSettings,
  updateGroupSettings,
} = require('./groupSettingsService');
const {
  loadOwnerSettings,
  updateOwnerSettings,
} = require('./ownerSettingsService');

function normalizePrefixValue(value) {
  return String(value || '').trim();
}

function validatePrefix(value) {
  const prefix = normalizePrefixValue(value);

  if (!prefix) {
    throw new Error('Prefixo vazio.');
  }

  if (prefix.length > 4) {
    throw new Error('Use um prefixo de no maximo 4 caracteres.');
  }

  if (/\s/.test(prefix)) {
    throw new Error('O prefixo nao pode conter espacos.');
  }

  return prefix;
}

function getDefaultPrefix() {
  return normalizePrefixValue(config.prefix) || '#';
}

function getGlobalPrefix() {
  const ownerSettings = loadOwnerSettings();
  return normalizePrefixValue(ownerSettings?.prefix) || getDefaultPrefix();
}

function setGlobalPrefix(prefix) {
  const validated = validatePrefix(prefix);

  updateOwnerSettings((current) => {
    current.prefix = validated;
    return current;
  });

  return validated;
}

function resetGlobalPrefix() {
  const nextPrefix = getDefaultPrefix();

  updateOwnerSettings((current) => {
    current.prefix = nextPrefix;
    return current;
  });

  return nextPrefix;
}

function getGroupPrefix(groupSettings) {
  const override = normalizePrefixValue(groupSettings?.prefixOverride);
  return override || '';
}

function setGroupPrefix(groupId, prefix) {
  const validated = validatePrefix(prefix);

  updateGroupSettings(groupId, (current) => {
    current.prefixOverride = validated;
    return current;
  });

  return validated;
}

function resetGroupPrefix(groupId) {
  updateGroupSettings(groupId, (current) => {
    current.prefixOverride = '';
    return current;
  });
}

function getEffectivePrefix({ isGroup = false, groupSettings = null } = {}) {
  if (isGroup) {
    return getGroupPrefix(groupSettings) || getGlobalPrefix();
  }

  return getGlobalPrefix();
}

function getPrefixSummary(groupSettings) {
  const globalPrefix = getGlobalPrefix();
  const groupPrefix = getGroupPrefix(groupSettings);

  return {
    defaultPrefix: getDefaultPrefix(),
    globalPrefix,
    groupPrefix,
    effectivePrefix: groupPrefix || globalPrefix,
  };
}

function resolvePrefixFromGroupId(groupId) {
  const groupSettings = loadGroupSettings(groupId);
  return getEffectivePrefix({ isGroup: true, groupSettings });
}

module.exports = {
  getDefaultPrefix,
  getEffectivePrefix,
  getGlobalPrefix,
  getGroupPrefix,
  getPrefixSummary,
  resetGlobalPrefix,
  resetGroupPrefix,
  resolvePrefixFromGroupId,
  setGlobalPrefix,
  setGroupPrefix,
  validatePrefix,
};
