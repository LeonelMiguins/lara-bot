const config = require('../config/config');
const { getPhrase } = require('./messagePhraseService');

function getMessageStyle() {
  return config.messageStyle || {};
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

function buildHeaderLabel(tone, forceTone, customLabel) {
  if (customLabel) {
    return String(customLabel).trim();
  }

  const style = getMessageStyle();
  const showToneByDefault = Boolean(style.header?.showToneByDefault);
  const shouldShowTone = forceTone ?? showToneByDefault;

  if (shouldShowTone && tone) {
    return `${config.botName.toUpperCase()} | ${tone}`;
  }

  return config.botName.toUpperCase();
}

function renderCabecalho({ tone = '', forceTone, label } = {}) {
  const style = getMessageStyle();
  const headerLeft = style.header?.left || '╭━━〔';
  const headerRight = style.header?.right || '〕';
  const headerLabel = buildHeaderLabel(tone, forceTone, label);
  return `${headerLeft} ${headerLabel} ${headerRight}`;
}

function renderRodape() {
  const style = getMessageStyle();
  return style.header?.footer || '╰━━━━━━━━━━━━━━━━━━';
}

function renderTitle(title) {
  const style = getMessageStyle();
  const sectionPrefix = style.sections?.prefix || '→';
  const wrapBold = style.sections?.wrapBold !== false;
  const normalizedTitle = String(title || '').trim();

  if (!normalizedTitle) {
    return '';
  }

  return wrapBold ? `${sectionPrefix} *${normalizedTitle}:*` : `${sectionPrefix} ${normalizedTitle}:`;
}

function renderTitulo(title) {
  return renderTitle(title);
}

function renderCommand(command) {
  const menuStyle = getMessageStyle().menu || {};
  const commandPrefix = menuStyle.commandPrefix || '⤷';
  const wrapCommandInCode = menuStyle.wrapCommandInCode !== false;
  const normalizedCommand = String(command || '').trim();

  if (!normalizedCommand) {
    return '';
  }

  return `${commandPrefix} ${wrapCommandInCode ? `\`${normalizedCommand}\`` : normalizedCommand}`;
}

function renderComando(command) {
  return renderCommand(command);
}

function renderComand(command) {
  return renderCommand(command);
}

function renderMsg(message) {
  return normalizeLines(message);
}

function renderMensagem(message) {
  return renderMsg(message);
}

function renderBloco({ header = {}, title = '', body = [], footer = true } = {}) {
  const lines = [renderCabecalho(header)];

  if (title) {
    lines.push(title);
    lines.push('');
  }

  lines.push(...renderMsg(body));

  if (footer) {
    lines.push(renderRodape());
  }

  return lines.join('\n');
}

function renderPhrase(key, variables = {}) {
  return getPhrase(key, variables);
}

function renderSection(title, lines = []) {
  return {
    title: String(title || '').trim(),
    lines: normalizeLines(lines),
  };
}

function renderSectionByKey(titleKey, lines = [], variables = {}) {
  return renderSection(renderPhrase(titleKey, variables), lines);
}

function renderSectionedBody({ lead = [], sections = [], footer = [] }) {
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

function renderPatternBody({
  summary = '',
  summaryKey = '',
  summaryVariables = {},
  reason = '',
  actions = [],
  reasonTitleKey = 'labels.reason',
  actionsTitleKey = 'labels.how_to_fix',
} = {}) {
  const lines = [];
  const resolvedSummary = summaryKey ? renderPhrase(summaryKey, summaryVariables) : summary;

  if (resolvedSummary) {
    lines.push(...normalizeLines(resolvedSummary));
  }

  if (reason) {
    if (lines.length) {
      lines.push('');
    }
    lines.push(renderTitle(renderPhrase(reasonTitleKey)));
    lines.push(...normalizeLines(reason));
  }

  const normalizedActions = normalizeLines(actions);
  if (normalizedActions.length) {
    if (lines.length) {
      lines.push('');
    }
    lines.push(renderTitle(renderPhrase(actionsTitleKey)));
    lines.push(...normalizedActions.map((action) => `- ${action}`));
  }

  return lines.join('\n');
}

module.exports = {
  getMessageStyle,
  normalizeLines,
  renderBloco,
  renderCabecalho,
  renderComand,
  renderComando,
  renderCommand,
  renderMensagem,
  renderMsg,
  renderPatternBody,
  renderPhrase,
  renderRodape,
  renderSection,
  renderSectionByKey,
  renderSectionedBody,
  renderTitle,
  renderTitulo,
};
