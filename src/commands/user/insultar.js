module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const sender = msg.pushName || 'Alguém';
  const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!mentionedJid) {
    await sock.sendMessage(from, { text: '❌ Marque alguém para insultar!' }, { quoted: msg });
    return;
  }

  const insultos = [
    "é tão inútil quanto um lápis sem ponta em uma prova de múltipla escolha.",
    "tem menos graça que tutorial de Excel em russo.",
    "tem o carisma de uma porta fechada às três da manhã.",
    "é o tipo de pessoa que tenta copiar na prova e ainda erra igual.",
    "tem QI negativo, é um perigo até para uma calculadora de bolso.",
    "é tão relevante quanto aviso de Wi-Fi em deserto.",
    "consegue ser mais perdido que atualização do Windows em apresentação ao vivo.",
    "tem a inteligência emocional de uma colher quebrada.",
    "tem tanta utilidade quanto um ventilador no Polo Norte.",
    "fala tanta besteira que poderia dar aula de como não ser ouvido.",
    "é o motivo pelo qual o botão de 'silenciar grupo' foi inventado.",
    "tem presença de espírito de um modem discado em 2025.",
    "é tão coerente quanto manual de micro-ondas escrito por um pombo.",
    "é o equivalente humano de um bug no código que ninguém consegue achar.",
    "é o tipo de pessoa que perde no cara ou coroa mesmo jogando sozinha.",
    "é tão convincente quanto link de vírus prometendo 'ganhar dinheiro fácil'.",
    "é a definição viva de 'erro 404: dignidade não encontrada'.",
    "é o argumento definitivo pra manter o grupo no modo apenas admins.",
    "tem mais desculpa do que aluno preguiçoso na segunda-feira.",
    "é o tipo de ser humano que atrasa até o relógio digital."
  ];

  const insulto = insultos[Math.floor(Math.random() * insultos.length)];

  const texto = `*${sender}* insultou *@${mentionedJid.split('@')[0]}*: ${insulto}`;

  await sock.sendMessage(from, {
    text: texto,
    mentions: [mentionedJid]
  }, { quoted: msg });
};
