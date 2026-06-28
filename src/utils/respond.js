const config = require('../config/config');

function frame({ title, body, tone = 'INFO' }) {
  const lines = [
    `╭━━〔 ${config.botName.toUpperCase()} | ${tone} 〕`,
  ];

  if (title) {
    lines.push(title);
    lines.push('');
  }

  for (const line of String(body || '').split('\n')) {
    lines.push(line);
  }

  lines.push('╰━━━━━━━━━━━━━━━━━━');
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

function info(title, body) {
  return frame({ title, body, tone: 'INFO' });
}

function success(title, body) {
  return frame({ title, body, tone: 'OK' });
}

function warning(title, body) {
  return frame({ title, body, tone: 'ALERTA' });
}

function error(title, body) {
  return frame({ title, body, tone: 'ERRO' });
}

function moderation(title, body) {
  return frame({ title, body, tone: 'MOD' });
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
  buildPatternBody,
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
