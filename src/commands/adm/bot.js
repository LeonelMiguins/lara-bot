const os = require('os');
const config = require('../../config/config');

module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos.' });
    return;
  }

  const groupMetadata = await sock.groupMetadata(from);
  const admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);

  if (!admins.includes(sender)) {
    await sock.sendMessage(from, { text: '🚫 Este comando é exclusivo para administradores do grupo.' });
    return;
  }

  // Se não passou subcomando, mostra a ajuda/info geral
  if (!args.length) {
    return sendBotInfo();
  }

  // Verifica o subcomando
  const subcommand = args[0].toLowerCase();

  if (subcommand === 'server') {
    return sendServerInfo();
  } else if (subcommand === 'clear') {
    return clearChats();
  } else {
    await sock.sendMessage(from, { text: '❌ Subcomando inválido. Use: server ou clear.' });
  }

  // Função para mostrar info geral (!bot)
  async function sendBotInfo() {
    const botInfo = sock.user;
    const botNumber = botInfo.id?.split(':')[0]?.replace('@s.whatsapp.net', '') || 'desconhecido';
    const uptime = os.uptime();

    const formatUptime = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h ${m}m`;
    };

    const info = `
╭━━━〔 *INFORMAÇÕES* 〕

*Nome:* ${config.botName}
*Versão:* ${config.version}
*Criador:* ${config.author}
*Colaboradores:* ${config.collaborators}
*Número bot:* wa.me/${botNumber}
*Ativo há:* ${formatUptime(uptime)}
*github do bot:* ${config.github}

╭━━━〔 *COMANDOS* 〕

  ${config.prefix}bot server
  ${config.prefix}infoGroup
    `.trim();

    await sock.sendMessage(from, { text: info, mentions: [sender] });
  }

  // Função para mostrar info do servidor (!bot server)
  async function sendServerInfo() {
    const cpu = os.cpus()[0]?.model || 'Desconhecido';
    const ram = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const uptime = os.uptime();

    const formatUptime = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h ${m}m`;
    };

    const info = `
╭━━━〔 *SERVIDOR* 〕━━━╮


⚙️ *CPU:* 
${cpu}
⚙️ *RAM:* 
${freeRam} GB/ ${ram} GB
⚙️ *Sistema:* 
${os.type()} ${os.release()} (${os.arch()})
⚙️ *Plataforma:*
 ${os.platform()}
⚙️ *Uptime:* 
${formatUptime(uptime)}

    `.trim();

    await sock.sendMessage(from, { text: info, mentions: [sender] });
  }

  // Função para limpar chats (!bot clear)
  async function clearChats() {
    const chats = sock.chats || [];

    let count = 0;

    for (const chatId of chats) {
      if (!chatId.endsWith('@g.us')) {
        try {
          await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: true, id: 'all' } });
          count++;
        } catch (err) {
          console.log('Erro ao tentar limpar chat privado:', chatId, err);
        }
      }
    }

    await sock.sendMessage(from, { text: `🧹 Limpeza finalizada. Chats privados limpos: ${count}` });
  }
};
