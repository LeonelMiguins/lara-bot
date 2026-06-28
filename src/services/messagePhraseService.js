const phrases = require('../config/message-phrases.json');

function resolvePhraseTemplate(key) {
  const parts = String(key || '').split('.').filter(Boolean);
  let current = phrases;

  for (const part of parts) {
    current = current?.[part];
    if (current === undefined) {
      return '';
    }
  }

  return typeof current === 'string' ? current : '';
}

function applyVariables(template, variables = {}) {
  return String(template || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => {
    const value = variables[key];
    return value === undefined || value === null ? `{${key}}` : String(value);
  });
}

function getPhrase(key, variables = {}) {
  const template = resolvePhraseTemplate(key);
  return applyVariables(template, variables);
}

module.exports = {
  applyVariables,
  getPhrase,
  resolvePhraseTemplate,
};
