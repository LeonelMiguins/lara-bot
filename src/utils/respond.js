const {
  renderBloco,
  renderCabecalho,
  renderCommand,
  renderMsg,
  renderPatternBody,
  renderRodape,
  renderSection,
  renderSectionedBody,
  renderTitle,
} = require('../services/messageRenderService');
const { getPhrase } = require('../services/messagePhraseService');

function frame({ title, body, tone = 'INFO', forceTone } = {}) {
  return renderBloco({
    header: { tone, forceTone },
    title,
    body,
  });
}

function createSection(title, lines = []) {
  return renderSection(title, lines);
}

function commandPanel(title, { lead = [], sections = [], footer = [], tone = '' } = {}) {
  return frame({
    title: '',
    body: renderSectionedBody({ lead, sections, footer }),
    tone,
    forceTone: false,
  });
}

function info(title, body) {
  return frame({ title, body, tone: 'INFO', forceTone: true });
}

function success(title, body) {
  return frame({ title, body, tone: 'OK', forceTone: true });
}

function warning(title, body) {
  return frame({ title, body, tone: 'ALERTA', forceTone: true });
}

function error(title, body) {
  return frame({ title, body, tone: 'ERRO', forceTone: true });
}

function moderation(title, body) {
  return frame({ title, body, tone: 'MOD', forceTone: true });
}

function phrase(key, variables = {}, options = {}) {
  const {
    tone = '',
    forceTone = false,
  } = options;

  return frame({
    title: '',
    body: getPhrase(key, variables),
    tone,
    forceTone,
  });
}

function phraseInfo(key, variables = {}) {
  return phrase(key, variables, { tone: 'INFO', forceTone: true });
}

function phraseSuccess(key, variables = {}) {
  return phrase(key, variables, { tone: 'OK', forceTone: true });
}

function phraseWarning(key, variables = {}) {
  return phrase(key, variables, { tone: 'ALERTA', forceTone: true });
}

function phraseError(key, variables = {}) {
  return phrase(key, variables, { tone: 'ERRO', forceTone: true });
}

function denied(title, reason, actions = []) {
  return error(title, renderPatternBody({
    summaryKey: 'common.denied_summary',
    reason,
    actions,
  }));
}

function invalidUsage(title, actions = [], reason = getPhrase('common.command_invalid')) {
  return warning(title, renderPatternBody({
    summaryKey: 'common.invalid_usage_summary',
    reason,
    actions,
  }));
}

function unavailable(title, reason, actions = []) {
  return warning(title, renderPatternBody({
    summaryKey: 'common.unavailable_summary',
    reason,
    actions,
  }));
}

function failure(title, reason, actions = []) {
  return error(title, renderPatternBody({
    summaryKey: 'common.failure_summary',
    reason,
    actions,
  }));
}

module.exports = {
  buildSectionedBody: renderSectionedBody,
  buildPatternBody: renderPatternBody,
  commandPanel,
  createSection,
  denied,
  error,
  failure,
  frame,
  info,
  invalidUsage,
  moderation,
  phrase,
  phraseError,
  phraseInfo,
  phraseSuccess,
  phraseWarning,
  renderCabecalho,
  renderCommand,
  renderMsg,
  renderRodape,
  renderTitle,
  success,
  unavailable,
  warning,
};
