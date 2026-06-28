const {
  getAntiLinkSettings,
  normalizeAntiLinkAction,
  normalizeAntiLinkTargetMode,
  normalizeBlacklistCategory,
  resetAntiFloodSettings,
  resetAntiLinkAction,
  resetAntiLinkTargetMode,
  setGroupFeature,
  updateAntiFloodSettings,
  updateAntiLinkAction,
  updateAntiLinkTargetMode,
} = require('../groupSettingsService');

function resolveAntiFloodCommand({ chatId, args = [], groupSettings }) {
  if (!args.length || String(args[0]).toLowerCase() === 'list') {
    return {
      status: 'show_status',
      settings: groupSettings,
    };
  }

  const action = String(args[0] || '').toLowerCase();

  if (action === 'on' || action === 'off') {
    const enabled = action === 'on';
    setGroupFeature(chatId, 'antiFlood', enabled);
    return { status: 'updated_state', enabled };
  }

  if (action === 'reset') {
    resetAntiFloodSettings(chatId);
    return { status: 'reset' };
  }

  const value = Number(args[1]);
  if (!Number.isFinite(value)) {
    return { status: 'invalid_number', action };
  }

  if (action === 'limite') {
    if (value < 2) {
      return { status: 'limit_too_low' };
    }

    updateAntiFloodSettings(chatId, { repeatedMessagesThreshold: Math.floor(value) });
    return { status: 'limit_updated' };
  }

  if (action === 'janela') {
    if (value < 3) {
      return { status: 'window_too_low' };
    }

    updateAntiFloodSettings(chatId, { windowMs: Math.floor(value * 1000) });
    return { status: 'window_updated' };
  }

  if (action === 'minimo' || action === 'min') {
    if (value < 1) {
      return { status: 'min_too_low' };
    }

    updateAntiFloodSettings(chatId, { minMessageLength: Math.floor(value) });
    return { status: 'min_updated' };
  }

  return { status: 'invalid_action' };
}

function resolveAntiLinkCommand({ chatId, args = [], groupSettings }) {
  const action = String(args[0] || '').toLowerCase();
  const antiLinkSettings = getAntiLinkSettings(groupSettings);

  if (!action || action === 'list' || action === 'status') {
    return {
      status: 'show_status',
      antiLinkSettings,
      groupSettings,
    };
  }

  if (action === 'acao') {
    const category = normalizeBlacklistCategory(args[1]);
    const mode = String(args[2] || '').toLowerCase();

    if (!category) {
      return { status: 'invalid_category' };
    }

    if (!mode) {
      return { status: 'missing_action_mode' };
    }

    const normalizedMode = normalizeAntiLinkAction(mode);
    if (!normalizedMode) {
      return { status: 'invalid_action_mode' };
    }

    updateAntiLinkAction(chatId, category, normalizedMode);
    return {
      status: 'category_action_updated',
      normalizedMode,
    };
  }

  if (action === 'reset') {
    const secondArg = String(args[1] || '').toLowerCase();
    const category = normalizeBlacklistCategory(args[1]);

    if (!category && secondArg !== 'modo') {
      return { status: 'invalid_category' };
    }

    if (secondArg === 'modo') {
      resetAntiLinkTargetMode(chatId);
      return { status: 'scope_reset' };
    }

    resetAntiLinkAction(chatId, category);
    return { status: 'action_reset' };
  }

  const targetMode = normalizeAntiLinkTargetMode(action);
  if (targetMode) {
    updateAntiLinkTargetMode(chatId, targetMode);
    return {
      status: 'mode_updated',
      targetMode,
    };
  }

  if (action !== 'on' && action !== 'off') {
    return { status: 'invalid_action' };
  }

  const enabled = action === 'on';
  setGroupFeature(chatId, 'antiLink', enabled);

  return {
    status: 'updated_state',
    enabled,
  };
}

module.exports = {
  resolveAntiFloodCommand,
  resolveAntiLinkCommand,
};
