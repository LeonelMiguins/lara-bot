const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const FEATURES_FILE = path.resolve(__dirname, '..', 'config', 'features.js');

function getFeatureEntries() {
  return Object.entries(config.features || {});
}

function isKnownFeature(featureName) {
  return Object.prototype.hasOwnProperty.call(config.features || {}, featureName);
}

function setFeature(featureName, enabled) {
  if (!isKnownFeature(featureName)) {
    throw new Error(`Modulo desconhecido: ${featureName}`);
  }

  config.features[featureName] = enabled;
  persistFeatures();
}

function persistFeatures() {
  const lines = [
    'module.exports = {',
    ...Object.entries(config.features || {}).map(
      ([key, value]) => `  ${key}: ${value ? 'true' : 'false'},`,
    ),
    '};',
    '',
  ];

  fs.writeFileSync(FEATURES_FILE, lines.join('\n'), 'utf8');
}

module.exports = {
  getFeatureEntries,
  isKnownFeature,
  setFeature,
};
