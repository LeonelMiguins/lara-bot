const { formatUserName, getHourMinute} = require('../../functions/globalFunctions');

/**
 * Evento para boas-vindas automáticas com nome e foto do perfil
 * @param {import('@whiskeysockets/baileys').WASocket} sock
 */
async function setupWelcome(sock) {
  sock.ev.on('group-participants.update', async (update) => {
    const { id: groupId, participants, action } = update;

    if (action === 'add') {
      try {
        // Pega nome do grupo
        const groupMetadata = await sock.groupMetadata(groupId);
        const groupName = groupMetadata.subject;

        for (const participant of participants) {
          // Usa função global para pegar o nome real do usuário
          const name = await formatUserName(participant, sock);

          // Pega foto do perfil da pessoa
          let profilePicUrl = null;
          try {
            profilePicUrl = await sock.profilePictureUrl(participant, 'image');
          } catch {
            // Se não tiver foto, segue sem imagem
          }

          // Mensagem personalizada
          const timestamp = getHourMinute();
          const welcomeMessage = `╭━━━〔 *BEM VINDO!* 〕━━━╮\n\n👋 Olá, *${name}*!\nSeja bem-vindo(a) ao *${groupName}*!\n\n✅ Divirta-se e respeite as regras do grupo!\n❗ Não invada PV sem permisão! É *BAN!!*\n\nEnvie *!regras* para ver regras.\nEnvie *!menu* para usar o bot`;

          console.log(`[${timestamp}] [👤 NOVO MEMBRO] Entrou no ${groupName}!`);

          // Envia com imagem se houver
          if (profilePicUrl) {
            await sock.sendMessage(groupId, {
              image: { url: profilePicUrl },
              caption: welcomeMessage,
              mentions: [participant]
            });
          } else {
            await sock.sendMessage(groupId, {
              text: welcomeMessage,
              mentions: [participant]
            });
          }
        }
      } catch (err) {
        console.log('Erro ao enviar mensagem de boas-vindas:', err);
      }
    }
  });
}

module.exports = setupWelcome;
