const fs = require('fs');
const path = require('path');
const config = require('../../config/config');
const loja = config.store;

module.exports = async (sock, msg, args) => {
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

  const codigo = args[0]?.toLowerCase();
  if (!codigo || !loja[codigo]) {
    await sock.sendMessage(from, { text: `❗ Código inválido. Use ${config.prefix}shop para ver os itens disponíveis.` });
    return;
  }

  const item = loja[codigo];

  if (userData.money < item.preco) {
    await sock.sendMessage(from, { text: `❗ Você não tem saldo suficiente para comprar *${item.nome}*.` });
    return;
  }

  userData.money -= item.preco;

  // Inicializa o inventário se ainda não existir
  if (!Array.isArray(userData.inventory)) {
    userData.inventory = [];
  }

  // Adiciona o item ao inventário
  userData.inventory.push(item.nome);

  fs.writeFileSync(rankPath, JSON.stringify(rankData, null, 2));

  await sock.sendMessage(from, {
    text: `✅ Você comprou *${item.nome}* por ${item.preco} money!\n💰 Novo saldo: ${userData.money} money`
  });
  console.log(`[🏬 STORE] Compraram ${item.nome} por 💵 ${item.preco} na LOJA`)
};
