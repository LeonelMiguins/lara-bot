const {
  getFeatureEntries,
  isKnownFeature,
  setGroupFeature,
} = require('../groupSettingsService');

function resolveWelcomeCommand({ chatId, args = [], groupSettings }) {
  const action = String(args[0] || '').toLowerCase();

  if (!action || action === 'list' || action === 'status') {
    return {
      status: 'show_status',
      enabled: Boolean(groupSettings?.features?.welcome),
    };
  }

  if (action !== 'on' && action !== 'off') {
    return { status: 'invalid_action' };
  }

  const enabled = action === 'on';
  setGroupFeature(chatId, 'welcome', enabled);

  return {
    status: 'updated',
    enabled,
  };
}

function resolveModulesCommand({ chatId, args = [], groupConfig }) {
  if (!args.length) {
    return {
      status: 'show_status',
      entries: getFeatureEntries(groupConfig),
    };
  }

  const featureName = args[0];
  const action = String(args[1] || '').toLowerCase();

  if (!isKnownFeature(featureName)) {
    return {
      status: 'unknown_feature',
      featureName,
    };
  }

  if (action !== 'on' && action !== 'off') {
    return {
      status: 'invalid_action',
      featureName,
    };
  }

  const enabled = action === 'on';
  setGroupFeature(chatId, featureName, enabled);

  return {
    status: 'updated',
    featureName,
    enabled,
  };
}

module.exports = {
  resolveModulesCommand,
  resolveWelcomeCommand,
};
