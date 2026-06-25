const config = require('../../config/config');
const { loadOwnerSettings, setOwnerNotificationsEnabled } = require('../../services/ownerSettingsService');
const { info, success, warning } = require('../../utils/respond');

function formatStatus() {
  const enabled = Boolean(loadOwnerSettings().notifications?.enabled);
  return enabled ? '🟢 Ligadas' : '🔴 Desligadas';
}

module.exports = {
  name: 'notificacoes',
  aliases: ['notificacoesdono', 'privado'],
  description: 'Liga ou desliga as notificacoes privadas do dono.',
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,
  async execute({ client, chatId, args }) {
    const action = String(args[0] || '').toLowerCase();

    if (!action || action === 'status' || action === 'list') {
      await client.sendMessage(
        chatId,
        info(
          'Notificacoes do dono',
          [
            `Status atual: ${formatStatus()}`,
            '',
            `Use *${config.prefix}notificacoes on* para ligar.`,
            `Use *${config.prefix}notificacoes off* para desligar.`,
          ].join('\n'),
        ),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        warning(
          'Notificacoes do dono',
          `Use *${config.prefix}notificacoes on* para ligar ou *${config.prefix}notificacoes off* para desligar.`,
        ),
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
