const os = require('os');
const config = require('../../config/config');
const { info, invalidUsage } = require('../../utils/respond');

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

module.exports = {
  name: 'bot',
  aliases: [],
  description: 'Mostra informacoes do bot.',
  menuExamples: [
    `${config.prefix}bot`,
    `${config.prefix}bot server`,
  ],
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, commandPrefix }) {
    const subcommand = (args[0] || '').toLowerCase();

    if (!subcommand) {
      const botNumber = client.info?.wid?.user || 'desconhecido';
      await client.sendMessage(
        chatId,
        info('Informacoes do bot', [
          `*${config.botName}*`,
          `Versao: ${config.version}`,
          `Numero: wa.me/${botNumber}`,
          `Dono: ${config.owner.name}`,
          '',
          `Use *${commandPrefix}bot server* para ver o status do host.`,
        ].join('\n')),
      );
      return;
    }

    if (subcommand !== 'server') {
      await client.sendMessage(
        chatId,
        invalidUsage('Comando bot', [
          `Use *${commandPrefix}bot* para ver os dados do bot.`,
          `Use *${commandPrefix}bot server* para ver os dados do servidor.`,
        ]),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      info('Status do servidor', [
        '*Status do servidor*',
        `CPU: ${os.cpus()[0]?.model || 'Desconhecida'}`,
        `RAM livre: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        `RAM total: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        `Sistema: ${os.type()} ${os.release()} (${os.arch()})`,
        `Uptime: ${formatUptime(os.uptime())}`,
      ].join('\n')),
    );
  },
};
