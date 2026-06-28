const {
  normalizeLines,
  renderBloco,
  renderCabecalho,
  renderCommand,
  renderMsg,
  renderRodape,
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

function buildPatternBody({ summary, reason, actions = [] }) {
  const lines = [];

  if (summary) {
    lines.push(...normalizeLines(summary));
  }

  if (reason) {
    if (lines.length) {
      lines.push('');
    }
    lines.push(renderTitle('Motivo'));
    lines.push(...normalizeLines(reason));
  }

  const normalizedActions = normalizeLines(actions);
  if (normalizedActions.length) {
    if (lines.length) {
      lines.push('');
    }
    lines.push(renderTitle('Como corrigir'));
    lines.push(...normalizedActions.map((action) => `- ${action}`));
  }

  return lines.join('\n');
}

function createSection(title, lines = []) {
  return {
    title: String(title || '').trim(),
    lines: normalizeLines(lines),
  };
}

function buildSectionedBody({ lead = [], sections = [], footer = [] }) {
  const lines = [];
  const normalizedLead = normalizeLines(lead);

  if (normalizedLead.length) {
    lines.push(...normalizedLead);
  }

  for (const section of sections) {
    const title = String(section?.title || '').trim();
    const content = normalizeLines(section?.lines || []);

    if (!title && !content.length) {
      continue;
    }

    if (lines.length) {
      lines.push('');
    }

    if (title) {
      lines.push(renderTitle(title));
    }

    if (content.length) {
      lines.push(...renderMsg(content));
    }
  }

  const normalizedFooter = normalizeLines(footer);
  if (normalizedFooter.length) {
    if (lines.length) {
      lines.push('');
    }
    lines.push(...normalizedFooter);
  }

  return lines.join('\n');
}

function commandPanel(title, { lead = [], sections = [], footer = [], tone = '' } = {}) {
  return frame({
    title: '',
    body: buildSectionedBody({ lead, sections, footer }),
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
  return error(title, buildPatternBody({
    summary: 'Voce nao pode usar este comando agora.',
    reason,
    actions,
  }));
}

function invalidUsage(title, actions = [], reason = 'Esse comando foi enviado de forma incompleta ou invalida.') {
  return warning(title, buildPatternBody({
    summary: 'Nao consegui entender o formato desse comando.',
    reason,
    actions,
  }));
}

function unavailable(title, reason, actions = []) {
  return warning(title, buildPatternBody({
    summary: 'Esse comando nao pode ser executado neste contexto.',
    reason,
    actions,
  }));
}

function failure(title, reason, actions = []) {
  return error(title, buildPatternBody({
    summary: 'Ocorreu um problema durante a execucao.',
    reason,
    actions,
  }));
}

module.exports = {
  buildSectionedBody,
  buildPatternBody,
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
