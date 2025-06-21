const fs = require('fs');
const path = require('path');

/**
 * Evento para avisar quando um membro sai ou é removido do grupo e limpar seus dados do rank
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').GroupParticipantsUpdate} update
 */
async function goodbyeHandler(sock, update) {
  try {
    const from = update.id;
    const action = update.action;
    const participants = update.participants;

    if (!from.endsWith('@g.us')) return;
    if (action !== 'remove' && action !== 'leave') return;

    for (const userId of participants) {
      const userName = userId.split('@')[0];
      let goodbyeText;

      if (action === 'remove') {
        goodbyeText = `👋 @${userName} foi removido do grupo. Esperamos que volte em breve!`;
      } else {
        goodbyeText = `👋 @${userName} saiu do grupo. Sentiremos sua falta!`;
      }

      try {
        await sock.sendMessage(from, {
          text: goodbyeText,
          mentions: [userId]
        });
      } catch (sendErr) {
        console.warn(`[Goodbye] Falha ao mandar mensagem para ${userId}:`, sendErr.message);
      }

      // Remover do sistema de rank
      const rankPath = path.join(__dirname, '..', '..', 'json', `rank-${from}.json`);
      if (fs.existsSync(rankPath)) {
        try {
          const rankData = JSON.parse(fs.readFileSync(rankPath));
          if (rankData[userId]) {
            delete rankData[userId];
            fs.writeFileSync(rankPath, JSON.stringify(rankData, null, 2));
            console.log(`[Goodbye] Removido ${userName} do rank de ${from}`);
          }
        } catch (rankErr) {
          console.error('[Goodbye] Erro ao editar JSON do rank:', rankErr);
        }
      }
    }
  } catch (err) {
    console.error('[Goodbye] Erro geral no handler:', err);
  }
}

module.exports = goodbyeHandler;