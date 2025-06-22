/**
 * Ativa o modo "sleep" no grupo (somente admins podem enviar mensagens)
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg
 */
async function sleep(sock, msg) {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❗ Este comando só pode ser usado em grupos.' });
    return;
  }

  const metadata = await sock.groupMetadata(from);
  const sender = msg.key.participant || msg.key.remoteJid;
  const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;

  if (!isAdmin) {
    await sock.sendMessage(from, { text: '❗ Apenas administradores podem usar este comando.' });
    return;
  }

  try {
    await sock.groupSettingUpdate(from, 'announcement'); // Apenas admins podem falar
    await sock.sendMessage(from, { text: '╭━━━〔 *GRUPO FECHADO* 〕\n\n✅ Modo silencioso ativado!\n Apenas administradores podem enviar mensagens.' });
    console.log(`[SLEEP] Grupo "${metadata.subject}" entrou em modo silencioso.`);
  } catch (err) {
    console.error('Erro ao ativar modo sleep:', err);
    await sock.sendMessage(from, { text: `❗ Erro ao ativar modo sleep: ${err.message}` });
  }
}

module.exports = sleep;
