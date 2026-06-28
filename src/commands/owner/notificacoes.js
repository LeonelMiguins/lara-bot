const config = require('../../config/config');
const { loadOwnerSettings, setOwnerNotificationsEnabled } = require('../../services/ownerSettingsService');
const { info, invalidUsage, success } = require('../../utils/respond');

function formatStatus() {
  const enabled = Boolean(loadOwnerSettings().notifications?.enabled);
  return enabled ? '🟢 Ligadas' : '🔴 Desligadas';
}

module.exports = {
  name: 'notificacoes',
  aliases: ['notificacoesdono', 'privado'],
  description: 'Liga ou desliga as notificacoes privadas do dono.',
  menuExample: `${config.prefix}notificacoes on|off`,
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,
  async execute({ client, chatId, args, commandPrefix }) {
    const action = String(args[0] || '').toLowerCase();

    if (!action || action === 'status' || action === 'list') {
      await client.sendMessage(
        chatId,
        info(
          'Notificacoes do dono',
          [
            `Status atual: ${formatStatus()}`,
            '',
            `Use *${commandPrefix}notificacoes on* para ligar.`,
            `Use *${commandPrefix}notificacoes off* para desligar.`,
          ].join('\n'),
        ),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage('Notificacoes do dono', [
          `Use *${commandPrefix}notificacoes on* para ligar as notificacoes.`,
          `Use *${commandPrefix}notificacoes off* para desligar as notificacoes.`,
        ]),
      );
      return;
    }

    const enabled = action === 'on';
    setOwnerNotificationsEnabled(enabled);
    await client.sendMessage(
      chatId,
      success(
        'Notificacoes do dono',
        `As notificacoes privadas agora estao ${enabled ? 'ligadas' : 'desligadas'}.`,
      ),
    );
  },
};
