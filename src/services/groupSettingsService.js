const config = require('../config/config');
const JsonFileStore = require('./storage/JsonFileStore');

const store = new JsonFileStore(config.paths.groupConfigDir);
const BLACKLIST_CATEGORY_META = {
  whatsappGroupLinks: {
    label: 'Links de WhatsApp',
    aliases: ['whatsapp', 'grupo', 'grupos', 'wpp'],
  },
  adultSites: {
    label: 'Conteúdo adulto',
    aliases: ['adulto', 'adult', 'nsfw', 'porno'],
  },
  betsSites: {
    label: 'Apostas',
    aliases: ['aposta', 'apostas', 'bets', 'bet'],
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sanitizeGroupId(groupId) {
  return String(groupId || '')
    .trim()
    .replace(/[^a-z0-9._-]/gi, '_');
}

function getGroupFileName(groupId) {
  return `${sanitizeGroupId(groupId)}.json`;
}

function createDefaultSettings(groupId) {
  const now = new Date().toISOString();

  return {
    schemaVersion: 1,
    groupId,
    createdAt: now,
    updatedAt: now,
    prefixOverride: '',
    features: clone(config.features || {}),
    antiFlood: clone(config.antiFlood || {}),
    antiLink: clone(config.antiLink || {}),
    blacklist: clone(config.blacklist || {}),
    groupRules: clone(config.groupRules || []),
  };
}

function normalizeSettings(groupId, data = {}) {
  const defaults = createDefaultSettings(groupId);

  return {
    ...defaults,
    ...data,
    groupId,
    schemaVersion: 1,
    prefixOverride: typeof data.prefixOverride === 'string' ? data.prefixOverride.trim() : '',
    features: {
      ...defaults.features,
      ...(data.features || {}),
    },
    antiFlood: {
      ...defaults.antiFlood,
      ...(data.antiFlood || {}),
    },
    antiLink: {
      ...defaults.antiLink,
      ...(data.antiLink || {}),
    },
    blacklist: {
      ...defaults.blacklist,
      ...(data.blacklist || {}),
    },
    groupRules: Array.isArray(data.groupRules) ? [...data.groupRules] : defaults.groupRules,
  };
}

function getSettingsPath(groupId) {
  return store.resolvePath(getGroupFileName(groupId));
}

function saveGroupSettings(groupId, data) {
  const normalized = normalizeSettings(groupId, {
    ...data,
    updatedAt: new Date().toISOString(),
  });

  return store.write(getGroupFileName(groupId), normalized);
}

function loadGroupSettings(groupId) {
  const fileName = getGroupFileName(groupId);

  if (!store.exists(fileName)) {
    return saveGroupSettings(groupId, createDefaultSettings(groupId));
  }

  try {
    const parsed = store.read(fileName);
    const normalized = normalizeSettings(groupId, parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      return saveGroupSettings(groupId, normalized);
    }

    return normalized;
  } catch {
    return saveGroupSettings(groupId, createDefaultSettings(groupId));
  }
}

function updateGroupSettings(groupId, updater) {
  const current = loadGroupSettings(groupId);
  const updated = typeof updater === 'function' ? updater(clone(current)) : current;
  return saveGroupSettings(groupId, updated);
}

function getFeatureEntries(groupSettings) {
  return Object.entries(groupSettings?.features || config.features || {});
}

function isKnownFeature(featureName) {
  return Object.prototype.hasOwnProperty.call(config.features || {}, featureName);
}

function setGroupFeature(groupId, featureName, enabled) {
  if (!isKnownFeature(featureName)) {
    throw new Error(`Modulo desconhecido: ${featureName}`);
  }

  return updateGroupSettings(groupId, (current) => {
    current.features[featureName] = enabled;
    return current;
  });
}

function getRuleEntries(groupSettings) {
  return [...(groupSettings?.groupRules || config.groupRules || [])];
}

function addGroupRule(groupId, text) {
  const normalizedText = String(text || '').trim();
  if (!normalizedText) {
    throw new Error('Regra vazia.');
  }

  return updateGroupSettings(groupId, (current) => {
    if (!current.groupRules.includes(normalizedText)) {
      current.groupRules.push(normalizedText);
    }
    return current;
  });
}

function removeGroupRule(groupId, index) {
  return updateGroupSettings(groupId, (current) => {
    current.groupRules.splice(index, 1);
    return current;
  });
}

function resetGroupRules(groupId) {
  return updateGroupSettings(groupId, (current) => {
    current.groupRules = clone(config.groupRules || []);
    return current;
  });
}

function getBlacklistCategoryMeta() {
  return BLACKLIST_CATEGORY_META;
}

function normalizeBlacklistCategory(input) {
  const normalizedInput = String(input || '').trim().toLowerCase();

  for (const [key, meta] of Object.entries(BLACKLIST_CATEGORY_META)) {
    if (key.toLowerCase() === normalizedInput || meta.aliases.includes(normalizedInput)) {
      return key;
    }
  }

  return '';
}

function getBlacklistEntries(groupSettings, category) {
  return [...(groupSettings?.blacklist?.[category] || [])];
}

function addBlacklistEntry(groupId, category, value) {
  const normalizedValue = String(value || '').trim().toLowerCase();
  if (!normalizedValue) {
    throw new Error('Entrada vazia.');
  }

  return updateGroupSettings(groupId, (current) => {
    const entries = current.blacklist[category] || [];
    if (!entries.includes(normalizedValue)) {
      entries.push(normalizedValue);
    }
    current.blacklist[category] = entries;
    return current;
  });
}

function removeBlacklistEntry(groupId, category, matcher) {
  return updateGroupSettings(groupId, (current) => {
    const entries = [...(current.blacklist[category] || [])];

    if (typeof matcher === 'number') {
      entries.splice(matcher, 1);
    } else {
      const normalizedMatcher = String(matcher || '').trim().toLowerCase();
      current.blacklist[category] = entries.filter((entry) => entry !== normalizedMatcher);
      return current;
    }

    current.blacklist[category] = entries;
    return current;
  });
}

function resetBlacklistCategory(groupId, category) {
  return updateGroupSettings(groupId, (current) => {
    current.blacklist[category] = clone(config.blacklist?.[category] || []);
    return current;
  });
}

function getAntiFloodSettings(groupSettings) {
  return {
    ...(config.antiFlood || {}),
    ...(groupSettings?.antiFlood || {}),
  };
}

function getAntiLinkSettings(groupSettings) {
  return {
    ...(config.antiLink || {}),
    ...(groupSettings?.antiLink || {}),
  };
}

function normalizeAntiLinkAction(action) {
  const normalized = String(action || '').trim().toLowerCase();

  if (['ban', 'banir', 'kick', 'remover'].includes(normalized)) {
    return 'ban';
  }

  if (['delete', 'apagar', 'del'].includes(normalized)) {
    return 'delete';
  }

  return '';
}

function normalizeAntiLinkTargetMode(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (['all', 'todos', 'geral'].includes(normalized)) {
    return 'all';
  }

  if (['users', 'user', 'usuarios', 'membros'].includes(normalized)) {
    return 'users';
  }

  return '';
}

function updateAntiLinkAction(groupId, category, action) {
  const normalizedAction = normalizeAntiLinkAction(action);
  if (!normalizedAction) {
    throw new Error('Acao invalida.');
  }

  return updateGroupSettings(groupId, (current) => {
    current.antiLink = {
      ...current.antiLink,
      [category]: normalizedAction,
    };
    return current;
  });
}

function resetAntiLinkAction(groupId, category) {
  return updateGroupSettings(groupId, (current) => {
    current.antiLink = {
      ...current.antiLink,
      [category]: clone(config.antiLink?.[category] || 'delete'),
    };
    return current;
  });
}

function updateAntiLinkTargetMode(groupId, targetMode) {
  const normalizedTargetMode = normalizeAntiLinkTargetMode(targetMode);
  if (!normalizedTargetMode) {
    throw new Error('Modo invalido.');
  }

  return updateGroupSettings(groupId, (current) => {
    current.antiLink = {
      ...current.antiLink,
      targetMode: normalizedTargetMode,
    };
    return current;
  });
}

function resetAntiLinkTargetMode(groupId) {
  return updateGroupSettings(groupId, (current) => {
    current.antiLink = {
      ...current.antiLink,
      targetMode: clone(config.antiLink?.targetMode || 'users'),
    };
    return current;
  });
}

function updateAntiFloodSettings(groupId, patch) {
  return updateGroupSettings(groupId, (current) => {
    current.antiFlood = {
      ...current.antiFlood,
      ...patch,
    };
    return current;
  });
}

function resetAntiFloodSettings(groupId) {
  return updateGroupSettings(groupId, (current) => {
    current.antiFlood = clone(config.antiFlood || {});
    return current;
  });
}

module.exports = {
  addBlacklistEntry,
  addGroupRule,
  createDefaultSettings,
  getFeatureEntries,
  getAntiFloodSettings,
  getAntiLinkSettings,
  getBlacklistCategoryMeta,
  getBlacklistEntries,
  getRuleEntries,
  getSettingsPath,
  isKnownFeature,
  loadGroupSettings,
  normalizeSettings,
  normalizeBlacklistCategory,
  normalizeAntiLinkAction,
  normalizeAntiLinkTargetMode,
  removeBlacklistEntry,
  removeGroupRule,
  resetAntiFloodSettings,
  resetAntiLinkAction,
  resetAntiLinkTargetMode,
  resetBlacklistCategory,
  resetGroupRules,
  saveGroupSettings,
  setGroupFeature,
  updateAntiLinkAction,
  updateAntiLinkTargetMode,
  updateAntiFloodSettings,
  updateGroupSettings,
};
