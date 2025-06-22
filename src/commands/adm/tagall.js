/**
 * Comando !tagall para mencionar até 30 membros do grupo
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 */
async function tagall(sock, msg) {
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

  // Pega até 30 membros
  const membersToTag = metadata.participants.slice(0, 30);

  const mentions = membersToTag.map(m => m.id);
  const text = `╭━━━〔 *MEMBROS* 〕\n\n🏷️ *Marcando todos os membros do grupo*:\n\n`+mentions.map(m => `@${m.split('@')[0]}`).join(' ');

  await sock.sendMessage(from, { text, mentions });
}

module.exports = tagall;
