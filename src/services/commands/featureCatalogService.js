const FEATURE_LABELS = {
  welcome: 'modules.feature_welcome',
  farewell: 'modules.feature_farewell',
  antiLink: 'modules.feature_anti_link',
  antiFlood: 'modules.feature_anti_flood',
  commandReaction: 'modules.feature_command_reaction',
};

function getFeatureLabelKey(featureName) {
  return FEATURE_LABELS[featureName] || '';
}

function getKnownFeatureNames() {
  return Object.keys(FEATURE_LABELS);
}

module.exports = {
  FEATURE_LABELS,
  getFeatureLabelKey,
  getKnownFeatureNames,
};
