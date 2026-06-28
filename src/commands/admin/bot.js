const os = require('os');
const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, invalidUsage } = require('../../utils/respond');

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
  help: {
    summary: 'Mostra informacoes do bot e, opcionalmente, do servidor.',
    examples: [
      '#bot',
      '#bot server',
    ],
    notes: [
      'O subcomando server mostra dados basicos do host atual.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, commandPrefix }) {
    const subcommand = (args[0] || '').toLowerCase();

    if (!subcommand) {
      const botNumber = client.info?.wid?.user || getPhrase('commands.bot.unknown_number');
      await client.sendMessage(
        chatId,
        commandPanel(getPhrase('commands.bot.title'), {
          sections: [
            createSection(getPhrase('commands.bot.section_bot'), [
              getPhrase('commands.bot.name_line', { value: config.botName }),
              getPhrase('commands.bot.version_line', { value: config.version }),
              getPhrase('commands.bot.number_line', { value: botNumber }),
              getPhrase('commands.bot.owner_line', { value: config.owner.name }),
            ]),
          ],
          footer: [
            getPhrase('commands.bot.footer_server', { prefix: commandPrefix }),
          ],
        }),
      );
      return;
    }

    if (subcommand !== 'server') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.bot.invalid_title'), [
          getPhrase('commands.bot.usage_bot', { prefix: commandPrefix }),
          getPhrase('commands.bot.usage_server', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      commandPanel(getPhrase('commands.bot.server_title'), {
        sections: [
          createSection(getPhrase('commands.bot.section_server'), [
            getPhrase('commands.bot.cpu_line', { value: os.cpus()[0]?.model || getPhrase('commands.bot.cpu_unknown') }),
            getPhrase('commands.bot.free_ram_line', { value: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) }),
            getPhrase('commands.bot.total_ram_line', { value: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) }),
            getPhrase('commands.bot.system_line', { value: `${os.type()} ${os.release()} (${os.arch()})` }),
            getPhrase('commands.bot.uptime_line', { value: formatUptime(os.uptime()) }),
          ]),
        ],
      }),
    );
  },
};
