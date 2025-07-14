module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const sender = msg.pushName || 'Alguém';
  const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  const abracos = [
    '🤗 deu um abraço apertado em',
    '🧸 abraçou com carinho',
    '❤️ deu um abraço quentinho em',
    '🐻 se jogou num abraço fofo com',
    '💞 apertou forte no abraço'
  ];

  if (!mentionedJid) {
    await sock.sendMessage(from, { text: '❌ Marque alguém para dar o abraço!' }, { quoted: msg });
    return;
  }

  const texto = `*${sender}* ${abracos[Math.floor(Math.random() * abracos.length)]} *@${mentionedJid.split('@')[0]}*! 🤗`;

  await sock.sendMessage(from, {
    text: texto,
    mentions: [mentionedJid]
  }, { quoted: msg });
};
