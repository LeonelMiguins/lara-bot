const fs = require('fs');
const path = require('path');
const { getHourMinute } = require('../../../functions/globalFunctions');

if (!global._rankCache) global._rankCache = {};

/**
 * Processa o sistema de rank (pontos, conquistas e status)
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg
 */
async function processRank(sock, msg) {
  const timestamp = getHourMinute();
  const from = msg.key.remoteJid;
  const user = msg.key.participant;
  if (!from?.endsWith('@g.us') || !user) return;

  const rankPath = path.join(__dirname, '../../../json', `rank-${from}.json`);
  if (!fs.existsSync(rankPath)) return; // ✅ IGNORA se rank estiver desativado

  let rankData = {};
  try {
    rankData = JSON.parse(fs.readFileSync(rankPath));
  } catch (e) {
    console.error(`[RANK] Erro ao ler JSON do grupo ${from}:`, e);
    return;
  }

  if (!rankData[user]) {
    rankData[user] = {
      money: 0,
      achievements: [],
      points: 0,
      status: "👤 Membro Comum",
      notifications: []
    };
  }

  if (!rankData[user].notifications) rankData[user].notifications = [];
  if (!rankData[user].achievements) rankData[user].achievements = [];

  rankData[user].points += 4;

  if (rankData[user].points % 100 === 0) {
    rankData[user].money += 50;
    console.log(`[${timestamp}] [🎁 BONUS] @${user.split('@')[0]} ganhou 💰 +50 moedas por atingir ${rankData[user].points} pontos`);
  }

  const pontos = rankData[user].points;
  let novoStatus = null;
  let nomeStatus = null;

  if (pontos >= 1500 && !rankData[user].notifications.includes('vip')) {
    novoStatus = '💎 Membro Vip';
    nomeStatus = 'vip';
    if (!rankData[user].achievements.includes('💎 Alcançou Membro Vip')) {
      rankData[user].achievements.push('💎 Alcançou Membro Vip');
      console.log(`[🎖️ CONQUISTA] @${user.split('@')[0]} conquistou: 💎 Alcançou Membro Vip`);
    }
  } else if (pontos >= 700 && pontos < 1000 && !rankData[user].notifications.includes('ouro')) {
    novoStatus = '🥇 Membro Ouro';
    nomeStatus = 'ouro';
  } else if (pontos >= 400 && pontos < 700 && !rankData[user].notifications.includes('prata')) {
    novoStatus = '🥈 Membro Prata';
    nomeStatus = 'prata';
  } else if (pontos >= 100 && pontos < 400 && !rankData[user].notifications.includes('bronze')) {
    novoStatus = '🥉 Membro Bronze';
    nomeStatus = 'bronze';
  }

  if (novoStatus) {
    rankData[user].status = novoStatus;
    rankData[user].notifications.push(nomeStatus);
    await sock.sendMessage(from, {
      text: `🎉 *Parabéns @${user.split('@')[0]}!* Você agora é ${novoStatus} por alcançar *${pontos} pontos*!`,
      mentions: [user]
    });
  }

  try {
    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.find(p => p.id === user && p.admin);
    if (pontos >= 500 && isAdmin && !rankData[user].notifications.includes('topadm')) {
      rankData[user].achievements.push('👑 Top ADM');
      rankData[user].notifications.push('topadm');
      await sock.sendMessage(from, {
        text: `👑 *Conquista desbloqueada!* @${user.split('@')[0]} agora é um *Top ADM*!`,
        mentions: [user]
      });
    }
  } catch (err) {
    console.warn(`[RANK] Erro ao verificar ADM para ${user}: ${err.message}`);
  }

  if (pontos >= 2000 && !rankData[user].notifications.includes('lendario')) {
    rankData[user].achievements.push('🔥 Lendário!');
    rankData[user].notifications.push('lendario');
    await sock.sendMessage(from, {
      text: `🔥 *Conquista desbloqueada!* @${user.split('@')[0]} agora é um *Lendário*!`,
      mentions: [user]
    });
  }

  global._rankCache[rankPath] = rankData;
  fs.writeFileSync(rankPath, JSON.stringify(rankData, null, 2));
}

module.exports = processRank;
