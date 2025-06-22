const fs = require('fs');
const path = require('path');
const { getHourMinute} = require('../../functions/globalFunctions');
const config = require('../../config/config');

/**
 * Comando para ativar, desativar ou mostrar ajuda do sistema de rank no grupo
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 * @param {string[]} args argumentos do comando (on/off/help)
 */
async function rank(sock, msg, args) {
  const timestamp = getHourMinute();
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

  if (!args.length) {
    await sock.sendMessage(from, { text: `╭━━━〔 *RANK MENU* 〕\n\n❗ Como usar os comandos do *RANK*:\n\n*${config.prefix}rank on* - Ativa o modo rank no grupo.\n\n*${config.prefix}rank off* - Desativa o modo rank no grupo.\n\n*${config.prefix}rank help - Exibe o funcionamento do rank.*.` });
    return;
  }

  const action = args[0].toLowerCase();
  const filePath = path.join(__dirname, '..', '..', 'json', `rank-${from}.json`);

  if (action === 'help') {
    const helpMessage = `
╭━━━〔 *SISTEMA RANK* 〕━━━╮

✅ *Comandos disponíveis:*

- *!top* → Ver os top 10 mais ativos

- *!status* @usuario → Ver status do membro

- *!store* → Gastar suas moedas na loja

📈 *Sistema de Pontos:*

- Cada mensagem válida dá pontos

- A cada 100 pontos: +50 moedas

- Pontuações desbloqueiam status especiais:

  🥉 Bronze: 100+
  🥈 Prata: 400+
  🥇 Ouro: 700+
  💎 Vip: 1500+

🎯 Use para competir e se destacar no grupo!
    `;
    await sock.sendMessage(from, { text: helpMessage });
    return;
  }

  if (action === 'on') {
    // CHECA ANTES DE TUDO
    if (fs.existsSync(filePath)) {
      await sock.sendMessage(from, { text: '❗ O sistema de rank já está ativado neste grupo.' });
      return;
    }

    const data = {};

    for (const p of metadata.participants) {
      data[p.id] = {
        money: 100,
        achievements: [],
        inventory: [],
        points: 0,
        status: "👤 Membro Comum",
        notifications: []
      };
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    await sock.sendMessage(from, { text: '✅ Sistema de rank ativado com sucesso!' });
    console.log(`✅[${timestamp}] [RANK] Rank ativado no grupo "${metadata.subject}"`);
    return;
  }

  if (action === 'off') {
    if (!fs.existsSync(filePath)) {
      await sock.sendMessage(from, { text: '⚠️ O sistema de rank não está ativado neste grupo.' });
      return;
    }

    fs.unlinkSync(filePath);
    await sock.sendMessage(from, { text: '❌ Sistema de rank desativado e dados apagados com sucesso!' });
    console.log(`🛑[${timestamp}] [RANK] Rank desativado no grupo "${metadata.subject}"`);
    return;
  }

  // Se nenhum comando válido
  await sock.sendMessage(from, { text: '❌ Comando inválido. Use *!rank on*, *!rank off* ou *!rank help*' });
}

module.exports = rank;
