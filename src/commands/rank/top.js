const fs = require('fs');
const path = require('path');


/**
 * Mostra o top 10 participantes com mais pontos
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 */
module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos.' });
    return;
  }

  const rankPath = path.join(__dirname, '..', '..', 'json', `rank-${from}.json`);

  if (!fs.existsSync(rankPath)) {
    await sock.sendMessage(from, { text: '🚫 O sistema de rank ainda não está ativo neste grupo. Use *!rank on* para iniciar.' });
    return;
  }

  const rankData = JSON.parse(fs.readFileSync(rankPath));
  const entries = Object.entries(rankData);

  // Ordenar pelo total de pontos e pegar top 10
  const sorted = entries.sort((a, b) => b[1].points - a[1].points).slice(0, 10);

  const resultLines = [];
  const mentions = [];

  for (let i = 0; i < sorted.length; i++) {
    const [userId, data] = sorted[i];
    let name;

    try {
      const result = await sock.onWhatsApp(userId);
      name = result[0]?.notify || userId.split('@')[0];
    } catch {
      name = userId.split('@')[0];
    }

    mentions.push(userId);

    const pos = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const username = userId.split('@')[0];

    resultLines.push(`${pos} - [ *${data.points}* ] - @${username}\n`);
  }

  // Monta a mensagem com bordas
  const finalMessage = [
    '╭━━━〔 🏆 *TOP 10* 〕━━━╮',
    '     ',
    ...resultLines,
    '╰━━━━━━━━━━━━━━━━━━━━━╯',
  ].join('\n');

  await sock.sendMessage(from, {
    text: finalMessage,
    mentions,
  });
};
