module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const sender = msg.pushName || 'Alguém';

  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentions || mentions.length < 2) {
    await sock.sendMessage(from, {
      text: '❌ Marque duas pessoas para fazer o ship!',
    }, { quoted: msg });
    return;
  }

  const [id1, id2] = mentions;
  const nome1 = id1.split('@')[0];
  const nome2 = id2.split('@')[0];

  // Lista de apelidos fofos para o casal
  const apelidosCasais = [
    '~Casal Pandinha~',
    '~Lovebirds~',
    '~Par Perfeito~',
    '~Almas Gêmeas~',
    '~Pombinhos~',
    '~Casal Cookie~',
    '~Unidos na Zoera~',
    '~Dupla Dinâmica~',
    '~Amor Eterno~',
    '~Parceiros de Crime~',
    '~Pevertidinhos~'
  ];

  // Escolhe um apelido aleatório para o casal
  const apelidoCasal = apelidosCasais[Math.floor(Math.random() * apelidosCasais.length)];

  const porcentagem = Math.floor(Math.random() * 101);

  let resposta = `💞 *SHIIIIIP DETECTADO!* 💞\n\n`;
  resposta += `❤️ *${sender}* quer saber o resultado entre:\n`;
  resposta += `@${nome1} + @${nome2}\n\n`;
  resposta += `✨ Nome do casal: *${apelidoCasal}*\n`;
  resposta += `🔮 Compatibilidade: *${porcentagem}%*\n\n`;

  if (porcentagem >= 90) resposta += `💍 Já pode marcar o casamento!`;
  else if (porcentagem >= 70) resposta += `💘 Um casal com futuro!`;
  else if (porcentagem >= 50) resposta += `🤔 Talvez role alguma coisa...`;
  else if (porcentagem >= 30) resposta += `😬 Precisa de uns ajustes aí...`;
  else resposta += `💔 Melhor cada um seguir seu caminho.`;

  await sock.sendMessage(from, {
    text: resposta,
    mentions: [id1, id2]
  }, { quoted: msg });
};
