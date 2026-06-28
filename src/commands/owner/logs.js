const config = require('../../config/config');
const { getLogFilePath, logsEnabled } = require('../../services/loggerService');
const { setOwnerLogsEnabled } = require('../../services/ownerSettingsService');
const { commandPanel, createSection, invalidUsage, success } = require('../../utils/respond');

function formatStatus() {
  return logsEnabled() ? '🟢 Ligados' : '🔴 Desligados';
}

module.exports = {
  name: 'logs',
  aliases: ['log'],
  description: 'Liga ou desliga a gravacao de logs do bot.',
  menuExample: `${config.prefix}logs on|off`,
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,
  async execute({ client, chatId, args, commandPrefix }) {
    const action = String(args[0] || '').toLowerCase();

    if (!action || action === 'status' || action === 'list') {
      await client.sendMessage(
        chatId,
        commandPanel('Logs do bot', {
          sections: [
            createSection('Status', [
              `Atual: ${formatStatus()}`,
              `Arquivo: ${getLogFilePath()}`,
            ]),
          ],
          footer: [
            `Use *${commandPrefix}logs on* para ligar.`,
            `Use *${commandPrefix}logs off* para desligar.`,
          ],
        }),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage('Logs do bot', [
          `Use *${commandPrefix}logs on* para ligar os logs.`,
          `Use *${commandPrefix}logs off* para desligar os logs.`,
        ]),
      );
      return;
    }

    const enabled = action === 'on';
    setOwnerLogsEnabled(enabled);

    await client.sendMessage(
      chatId,
      success(
        'Logs do bot',
        `A gravacao de logs agora está ${enabled ? 'ligada' : 'desligada'}.`,
      ),
    );
  },
};
