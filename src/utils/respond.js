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

module.exports = {
  error,
  frame,
  info,
  moderation,
  success,
  warning,
};
