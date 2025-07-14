const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;

  // Verifica se está em grupo
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, {
      text: '❌ Este comando só pode ser usado em grupos.',
    }, { quoted: msg });
    return;
  }

  try {
    // Info básica do grupo
    const metadata = await sock.groupMetadata(from);
    const nomeGrupo = metadata.subject;
    const idGrupo = metadata.id;
    const participantes = metadata.participants;
    const criadorGrupo = metadata.owner || 'Desconhecido';
    const dataCriacao = metadata.creation
      ? format(new Date(metadata.creation * 1000), "dd 'de' MMMM 'de' yyyy - HH:mm", { locale: ptBR })
      : 'Desconhecida';

    const totalMembros = participantes.length;
    const adms = participantes.filter(p => p.admin !== null);
    const totalAdms = adms.length;

    let resposta = `╭━━━〔 📄 *Informações do Grupo* 〕\n\n`;
    resposta += `Nome: *${nomeGrupo}*\n`;
    resposta += `ID: *${idGrupo}*\n`;
    resposta += `Membros: *${totalMembros}*\n`;
    resposta += `Admins: *${totalAdms}*\n`;
    resposta += `Criador: *${criadorGrupo.split('@')[0]}*\n`;
    resposta += `Criado em: *${dataCriacao}*\n`;

    await sock.sendMessage(from, {
      text: resposta,
      mentions: [criadorGrupo],
    }, { quoted: msg });
  } catch (err) {
    console.error('Erro ao obter info do grupo:', err);
    await sock.sendMessage(from, {
      text: '⚠️ Ocorreu um erro ao buscar as informações do grupo.',
    }, { quoted: msg });
  }
};
