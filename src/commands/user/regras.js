module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  // Verifica se é grupo
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos.' });
    return;
  }

  // Pega nome do grupo
  const metadata = await sock.groupMetadata(from);
  const nomeGrupo = metadata.subject;

  const texto = 
`╭━━━〔 *REGRAS DO GRUPO* 〕━━━╮

📛 Grupo: *${nomeGrupo}*

*O que NÃO pode:*
🚫 Links de grupos, canais e comunidades
🚫 Conteúdo adulto ou ofensivo
🚫 Spam ou flood de mensagens
🚫 Discussões políticas ou religiosas
🚫 Falta de respeito com membros e admins
🚫 Divulgação de apostas, pirâmides ou golpes

*O que PODE:*
✅ Compartilhar memes e vídeos leves
✅ Fazer amizades e bater papo
✅ Divulgar seu Instagram, TikTok e projetos
✅ Tirar dúvidas e conversar sobre o tema do grupo
✅ Participar de enquetes e jogos quando tiver

🛡️ O não cumprimento das regras pode levar a *banimento imediato* sem aviso.

══════╝`;

  await sock.sendMessage(from, { text: texto });
};
