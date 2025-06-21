/**
 * Comando !adms para mencionar todos os admins do grupo
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 */
async function adms(sock, msg) {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos.' });
    return;
  }

  const metadata = await sock.groupMetadata(from);
  
  // Filtra só os admins (pode ser 'admin' ou 'superadmin')
  const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

  if (admins.length === 0) {
    await sock.sendMessage(from, { text: '⚠️ Não há administradores no grupo.' });
    return;
  }

  const mentions = admins.map(a => a.id);
  const groupName = metadata.subject || 'este grupo';

  const text = `🔔 Solicitando a atenção de todos os administradores de *${groupName}*:\n\n@${mentions.map(m => m.split('@')[0]).join(' @')}\n\n⚠️ Por favor, fiquem atentos às mensagens e às solicitações do grupo.`;

  await sock.sendMessage(from, { text, mentions });
}

module.exports = adms;
