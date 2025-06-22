const axios = require('axios'); // Pode remover se não usar em outros comandos
const path = require('path');

/**
 * Envia o link de convite do grupo
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 */
module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❗ Este comando só pode ser usado em grupos.' });
    return;
  }

  const groupMetadata = await sock.groupMetadata(from);
  const groupName = groupMetadata.subject;
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  const botIsAdmin = groupMetadata.participants.find(p => p.id === botNumber && p.admin);

  if (!botIsAdmin) {
    await sock.sendMessage(from, { text: '❗ Eu preciso ser *admin* para gerar o link do grupo.' });
    return;
  }

  try {
    const groupInviteCode = await sock.groupInviteCode(from);
    const inviteLink = `https://chat.whatsapp.com/${groupInviteCode}`;

    const caption = `╭━━━〔 *LINK DO GRUPO* 〕 ⭑\n` +
                    `                     `+
                    ` 👥 *${groupName}*\n` +
                    `\n` +
                    ` 🔗 *Link:*\n` +
                    ` ${inviteLink}\n` +
                    `╰────── ⭑`;

    await sock.sendMessage(from, { text: caption });

  } catch (err) {
    console.error('Erro ao gerar link do grupo:', err);
    await sock.sendMessage(from, { text: '❗ Não foi possível obter o link do grupo.' });
  }
};
