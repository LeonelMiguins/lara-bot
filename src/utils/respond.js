const config = require('../config/config');

function getMessageStyle() {
  return config.messageStyle || {};
}

function buildHeaderLabel(tone, forceTone) {
  const style = getMessageStyle();
  const showToneByDefault = Boolean(style.header?.showToneByDefault);
  const shouldShowTone = forceTone ?? showToneByDefault;

  if (shouldShowTone && tone) {
    return `${config.botName.toUpperCase()} | ${tone}`;
  }

  return config.botName.toUpperCase();
}

function frame({ title, body, tone = 'INFO', forceTone } = {}) {
  const style = getMessageStyle();
  const headerLeft = style.header?.left || '╭━━〔';
  const headerRight = style.header?.right || '〕';
  const footer = style.header?.footer || '╰━━━━━━━━━━━━━━━━━━';
  const headerLabel = buildHeaderLabel(tone, forceTone);
  const lines = [
    `${headerLeft} ${headerLabel} ${headerRight}`,
  ];

  if (title) {
    lines.push(title);
    lines.push('');
  }

  for (const line of String(body || '').split('\n')) {
    lines.push(line);
  }

  lines.push(footer);
  return lines.join('\n');
}

function normalizeLines(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeLines(item))
      .filter(Boolean);
  }

  const text = String(value || '').trim();
  if (!text) {
    return [];
  }

  return text.split('\n');
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
    lines.push('*Motivo*');
    lines.push(...normalizeLines(reason));
  }

  const normalizedActions = normalizeLines(actions);
  if (normalizedActions.length) {
    if (lines.length) {
      lines.push('');
    }
    lines.push('*Como corrigir*');
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
  const style = getMessageStyle();
  const sectionPrefix = style.sections?.prefix || '→';
  const wrapBold = style.sections?.wrapBold !== false;
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
      lines.push(wrapBold ? `${sectionPrefix} *${title}:*` : `${sectionPrefix} ${title}:`);
    }

    if (content.length) {
      lines.push(...content);
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
  success,
  unavailable,
  warning,
};
