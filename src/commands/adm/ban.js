const config = require('../../config/config');

async function ban(sock, msg) {
  const from = msg.key.remoteJid;

  // Verifica se é grupo
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❗ Este comando só funciona em grupos.' });
    return;
  }

  // Busca admins do grupo
  const groupMetadata = await sock.groupMetadata(from);
  const admins = groupMetadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  // Quem enviou o comando
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!admins.includes(sender)) {
    await sock.sendMessage(from, { text: '❗ Apenas administradores podem usar este comando.' });
    return;
  }

  // Tenta pegar o participante a banir - tentativa 1: via reply
  let target = null;
  if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    target = msg.message.extendedTextMessage.contextInfo.participant;
  }

  // tentativa 2: via menção @ (pode estar em extendedTextMessage)
  if (!target) {
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentions.length > 0) target = mentions[0];
  }

  // tentativa 3: no texto puro, extrair @user
  if (!target && msg.message?.conversation) {
    const text = msg.message.conversation;
    const mentionMatch = text.match(/@(\d{5,16})/); // extrai número do usuário
    if (mentionMatch) target = mentionMatch[1] + '@s.whatsapp.net';
  }

  if (!target) {
    await sock.sendMessage(from, { text: `❗ Responda uma menssagem com *${config.prefix}ban* ou mencionando o membro *${config.prefix}ban* @` });
    return;
  }

  if (admins.includes(target)) {
    await sock.sendMessage(from, { text: '❗ Não posso remover um administrador do grupo.' });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(from, [target], 'remove');
    await sock.sendMessage(from, { text: `Usuário removido do grupo.` });
    console.log(`Usuário ${target} foi removido do grupo ${from}`);
  } catch (err) {
    console.error('Erro ao remover usuário:', err);
    await sock.sendMessage(from, { text: `Erro ao remover usuário: ${err.message}` });
  }
}

module.exports = ban;
