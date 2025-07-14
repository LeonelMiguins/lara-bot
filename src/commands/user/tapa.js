module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const sender = msg.pushName || 'Alguém';
  const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  const tapas = [
    '💥 deu um tapa forte na cara de',
    '🖐 estalou a mão no rosto de',
    '👋 acertou um tapão em',
    '🥴 deu um tapa de virar o pescoço em',
    '👋 deu um tapa estilo novela mexicana em'
  ];

  if (!mentionedJid) {
    await sock.sendMessage(from, { text: '❌ Marque alguém para dar o tapa!' }, { quoted: msg });
    return;
  }

  const texto = `*${sender}* ${tapas[Math.floor(Math.random() * tapas.length)]} *@${mentionedJid.split('@')[0]}*! 👋`;

  await sock.sendMessage(from, {
    text: texto,
    mentions: [mentionedJid]
  }, { quoted: msg });
};
