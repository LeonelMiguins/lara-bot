const fs = require('fs');
const path = require('path');
const config = require('../../config/config');
const frasesEngracadas = config.drinks;

/**
 * Comando !drink
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 * @param {string[]} args 
 */
module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};
  const mention = contextInfo.mentionedJid || [];
  const quoted = contextInfo.participant; // Se for uma resposta de mensagem

  if (!isGroup) {
    await sock.sendMessage(from, { text: '❗ Este comando só pode ser usado em grupos.' });
    return;
  }

  const rankPath = path.join(__dirname, '..', '..', 'json', `rank-${from}.json`);
  if (!fs.existsSync(rankPath)) {
    await sock.sendMessage(from, {
      text: `❗ O sistema de moedas ainda não está ativo neste grupo. Use *${config.prefix}rank on* para iniciar.` ,
    });
    return;
  }

  const rankData = JSON.parse(fs.readFileSync(rankPath));
  const fullSender = sender.split('/')[0];
  const username = fullSender.split('@')[0];

  // Nome de exibição (fallback para número se falhar)
  let senderName;
  try {
    senderName = await sock.getName(fullSender);
  } catch {
    senderName = `@${username}`;
  }

  if (!rankData[fullSender]) {
    rankData[fullSender] = { points: 0, money: 0 };
  }

  const userMoney = rankData[fullSender].money;
  const pricePerDrink = 10;
  const priceAll = 50;

  let finalMessage = '';
  const mentions = [];

  // RODADA GERAL
  if (args[0] === 'all') {
    if (userMoney < priceAll) {
      await sock.sendMessage(from, {
        text: `❗ Você não tem moedas suficientes. São necessárias *${priceAll} moedas* para pagar bebida pra geral!`,
      });
      return;
    }

    rankData[fullSender].money -= priceAll;

    const participants = Object.keys(rankData).filter(u => u !== fullSender);
    participants.forEach(p => mentions.push(p + '@s.whatsapp.net'));
    mentions.push(fullSender);

const fraseAll = config.drinksAll[Math.floor(Math.random() * config.drinksAll.length)];
finalMessage = fraseAll
  .replace(/@quem/g, `@${username}`)
  .replace(/{preco}/g, priceAll)
  .replace(/{saldo}/g, rankData[fullSender].money);


  // BEBIDA PARA UMA PESSOA (menção ou resposta)
  } else if (mention.length > 0 || quoted) {
    const target = mention[0] || quoted;
    const targetUsername = target.split('@')[0];

    if (userMoney < pricePerDrink) {
      await sock.sendMessage(from, {
        text: `❗ Você precisa de pelo menos *${pricePerDrink} moedas* para oferecer uma bebida.`,
      });
      return;
    }

    rankData[fullSender].money -= pricePerDrink;

    mentions.push(target);
    mentions.push(fullSender);

    let frase = frasesEngracadas[Math.floor(Math.random() * frasesEngracadas.length)];
    frase = frase
      .replace('@quem', `@${username}`)
      .replace('@alvo', `@${targetUsername}`);

    finalMessage =
      `${frase}\n\n` +
      `💸 *Saldo atual:* ${rankData[fullSender].money} moedas`;

  // USO INCORRETO
  } else {
    await sock.sendMessage(from, {
      text: `❗ Use o comando assim:\n\n*${config.prefix}drink @usuário* ou respondendo uma menssagem com *${config.prefix}drink* (Custo: ${pricePerDrink} moedas)\n\n*${config.prefix}drink all* — Rodada pra todos os membros! (Custo: ${priceAll} moedas)`,
    });
    return;
  }

  fs.writeFileSync(rankPath, JSON.stringify(rankData, null, 2));

  await sock.sendMessage(from, {
    text: finalMessage,
    mentions,
  });
};
