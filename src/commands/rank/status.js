const fs = require('fs');
const path = require('path');
;

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos.' });
    return;
  }

const rankPath = path.join(__dirname, '..', '..', 'json', `rank-${from}.json`)

  if (!fs.existsSync(rankPath)) {
    await sock.sendMessage(from, { text: '🚫 O sistema de rank ainda não está ativo neste grupo. Use *!rank on* para iniciar.' });
    return;
  }

  const rankData = JSON.parse(fs.readFileSync(rankPath));

  // === Detecta o usuário alvo (mencionado, respondido ou autor) ===
  let target;

  try {
    const context = msg.message?.extendedTextMessage?.contextInfo;

    if (context?.mentionedJid?.length) {
      // Se mencionar alguém
      target = context.mentionedJid[0];
    } else if (context?.quotedMessage) {
      // Se respondeu uma mensagem, pega o autor da mensagem respondida
      target = context.participant;
    } else {
      // Senão, pega quem enviou o comando
      target = msg.key.participant || msg.key.remoteJid;
    }
  } catch {
    target = msg.key.participant || msg.key.remoteJid;
  }

  if (!target) {
    await sock.sendMessage(from, { text: '❌ Não foi possível identificar o usuário alvo.' });
    return;
  }

  const data = rankData[target];

  if (!data) {
    await sock.sendMessage(from, { text: '❌ Este membro ainda não possui dados no sistema de rank.' });
    return;
  }

  // Preparar as infos para mostrar
  const conquistas = data.achievements?.length
    ? data.achievements.map(c => `🏆 ${c}`).join('\n')
    : '🚫 Nenhuma conquista';

  const inventario = data.inventory?.length
    ? data.inventory.map(c => `🎒 ${c}`).join('\n')
    : '🚫 Nenhum item para mostrar';

  const username = target.split('@')[0].toUpperCase();

  const message = `
╭━━━〔 🏆 *STATUS* 〕━━━╮

🧑‍💼 *Nome:* @${username}
🏅 *Status:* ${data.status}
💰 *Moedas:* ${data.money}
🎯 *Pontos:* ${data.points}

🏆 *Conquistas:*
${conquistas}

🎒 *Inventário:*
${inventario}

╰━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

  await sock.sendMessage(from, {
    text: message,
    mentions: [target]
  });
};
