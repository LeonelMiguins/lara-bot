/**
 * Promover usuário a administrador pelo reply ou @
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg
 */
async function adm(sock, msg) {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: 'Este comando só funciona em grupos.' });
    return;
  }

  // Pega metadata do grupo e admins
  const groupMetadata = await sock.groupMetadata(from);
  const admins = groupMetadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  const sender = msg.key.participant || msg.key.remoteJid;

  // Só admins podem usar
  if (!admins.includes(sender)) {
    await sock.sendMessage(from, { text: 'Apenas administradores podem usar este comando.' });
    return;
  }

  // Pega o alvo:
  // Primeiro tenta pelo reply (contextInfo.participant)
  let target = msg.message?.extendedTextMessage?.contextInfo?.participant;

  // Se não tiver reply, tenta pegar pelo @
  if (!target) {
    const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length > 0) {
      target = mentions[0];
    }
  }

  if (!target) {
    await sock.sendMessage(from, { text: 'Marque o usuário com @ ou responda a mensagem dele para promover a administrador.' });
    return;
  }

  // Verifica se já é admin
  if (admins.includes(target)) {
    await sock.sendMessage(from, { text: 'Este usuário já é administrador.' });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(from, [target], 'promote');
    await sock.sendMessage(from, { text: `Usuário promovido a administrador com sucesso.` });
    console.log(`Usuário ${target} foi promovido a administrador no grupo ${from}`);
  } catch (err) {
    await sock.sendMessage(from, { text: `Erro ao promover usuário: ${err.message}` });
  }
}

module.exports = adm;
