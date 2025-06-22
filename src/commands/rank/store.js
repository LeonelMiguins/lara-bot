const fs = require('fs');
const path = require('path');
const config = require('../../config/config');
const loja = config.store;


module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const rankPath = path.join(__dirname, '..', '..', 'json', `rank-${from}.json`);

  if (!from.endsWith('@g.us')) return;
  if (!fs.existsSync(rankPath)) return;

  const rankData = JSON.parse(fs.readFileSync(rankPath));
  const userData = rankData[sender];

  if (!userData) {
    await sock.sendMessage(from, { text: '❗ Você ainda não está no sistema de rank.' });
    return;
  }

  const saldo = userData.money;
  let texto = `╭━━━〔 *🏪 LOJA DO GRUPO* 〕\n`;
  texto += `┃ 💰 Saldo: *${saldo} moedas*\n`;
  texto += `┃ 📦 Itens disponíveis:\n\n`;

  for (const codigo in loja) {
    const item = loja[codigo];
    texto += ` ├─ *${item.nome}*\n`;
    texto += `    💵 ${item.preco} moedas | Código: \`${codigo}\`\n\n`;
  }

  texto += `╰━━━━━━━━━━━━━━━━━━━━━━━╯\n📥 Use: *${config.prefix}buy <código>* para comprar.`;

  await sock.sendMessage(from, { text: texto });
};
