function nowLabel() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function jidToHandle(jid) {
  const raw = String(jid || '').split('@')[0];
  const digits = digitsOnly(raw);
  return digits || raw || 'usuario';
}

function formatPairingCode(code) {
  return String(code || '')
    .replace(/\s+/g, '')
    .match(/.{1,4}/g)
    ?.join('-') || code;
}

module.exports = {
  digitsOnly,
  formatPairingCode,
  jidToHandle,
  nowLabel,
};
