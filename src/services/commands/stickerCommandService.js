const {
  getStickerSettings,
  setGroupFeature,
  updateStickerSettings,
} = require('../groupSettingsService');
const {
  getAvailableCategories,
  getRandomPackInfo,
  getRandomPackWithStickers,
} = require('../stickerPackService');

function normalizeOnOff(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'on') {
    return true;
  }
  if (normalized === 'off') {
    return false;
  }
  return null;
}

function buildStickerStatus(groupSettings) {
  return getStickerSettings(groupSettings);
}

function resolveStickerSettingsCommand({
  chatId,
  args = [],
  groupSettings,
  senderIsOwner = false,
}) {
  const stickerSettings = getStickerSettings(groupSettings);
  const scope = String(args[0] || 'status').toLowerCase();
  const value = String(args[1] || '').toLowerCase();

  if (!args.length || scope === 'status' || scope === 'list') {
    return {
      status: 'show_status',
      settings: stickerSettings,
      autoEnabled: Boolean(groupSettings?.features?.stickerAuto),
    };
  }

  if (scope === 'auto') {
    const enabled = normalizeOnOff(value);
    if (enabled === null) {
      return { status: 'invalid_auto' };
    }

    setGroupFeature(chatId, 'stickerAuto', enabled);
    if (enabled) {
      updateStickerSettings(chatId, { lastAutoSentAt: new Date().toISOString() });
    }

    return { status: 'auto_updated', enabled };
  }

  if (scope === 'tempo') {
    if (!senderIsOwner) {
      return { status: 'tempo_owner_only' };
    }

    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes < 5 || minutes > 1440) {
      return { status: 'invalid_minutes' };
    }

    updateStickerSettings(chatId, { autoSendIntervalMinutes: Math.floor(minutes) });
    return {
      status: 'interval_updated',
      minutes: Math.floor(minutes),
    };
  }

  if (scope === 'membros') {
    const enabled = normalizeOnOff(value);
    if (enabled === null) {
      return { status: 'invalid_members' };
    }

    updateStickerSettings(chatId, { allowMemberPackRequests: enabled });
    return { status: 'members_updated', enabled };
  }

  if (scope === 'adulto' || scope === 'adult' || scope === '+18') {
    const enabled = normalizeOnOff(value);
    if (enabled === null) {
      return { status: 'invalid_adult' };
    }

    updateStickerSettings(chatId, { allowAdult: enabled });
    return { status: 'adult_updated', enabled };
  }

  return { status: 'invalid_scope' };
}

async function resolvePackRequest({
  category = '',
  groupSettings,
  senderIsAdmin = false,
  senderIsOwner = false,
}) {
  const settings = getStickerSettings(groupSettings);

  if (!settings.allowMemberPackRequests && !senderIsAdmin && !senderIsOwner) {
    return { status: 'members_blocked' };
  }

  const normalizedCategory = String(category || '').trim().toLowerCase();

  if (normalizedCategory === 'categorias' || normalizedCategory === 'cats') {
    const categories = await getAvailableCategories({ allowAdult: settings.allowAdult });
    return {
      status: 'show_categories',
      categories,
    };
  }

  if (normalizedCategory) {
    const categories = await getAvailableCategories({ allowAdult: settings.allowAdult });
    if (!categories.includes(normalizedCategory)) {
      return { status: 'invalid_category' };
    }
  }

  const pack = await getRandomPackWithStickers({
    allowAdult: settings.allowAdult,
    category: normalizedCategory,
  });

  if (!pack) {
    return { status: 'no_pack' };
  }

  return {
    status: 'send_pack',
    pack,
    category: normalizedCategory,
  };
}

async function resolveAutoPackForGroup(groupSettings) {
  const settings = getStickerSettings(groupSettings);
  const packInfo = await getRandomPackInfo({
    allowAdult: settings.allowAdult,
  });

  if (!packInfo) {
    return null;
  }

  return getRandomPackWithStickers({
    allowAdult: settings.allowAdult,
    category: packInfo.category,
  });
}

module.exports = {
  buildStickerStatus,
  resolveAutoPackForGroup,
  resolvePackRequest,
  resolveStickerSettingsCommand,
};
