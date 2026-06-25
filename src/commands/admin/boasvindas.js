const config = require('../../config/config');
const { setGroupFeature } = require('../../services/groupSettingsService');
const { info, success, warning } = require('../../utils/respond');

function formatStatus(groupSettings) {
  const enabled = Boolean(groupSettings?.features?.welcome);
  return enabled ? '🟢 Ligado' : '🔴 Desligado';
}

module.exports = {
  name: 'boasvindas',
  aliases: ['welcome', 'bemvindo', 'bemvindos'],
  description: 'Liga ou desliga as boas-vindas automáticas do grupo.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings }) {
    const action = String(args[0] || '').toLowerCase();

    if (!action || action === 'list' || action === 'status') {
      await client.sendMessage(
        chatId,
        info(
          'Boas-vindas do grupo',
          [
            `Status atual: ${formatStatus(groupSettings)}`,
            '',
            `Use *${config.prefix}boasvindas on* para ligar.`,
            `Use *${config.prefix}boasvindas off* para desligar.`,
          ].join('\n'),
        ),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        warning(
          'Boas-vindas do grupo',
          `Use *${config.prefix}boasvindas on* para ligar ou *${config.prefix}boasvindas off* para desligar.`,
        ),
      );
      return;
    }

    const enabled = action === 'on';
    setGroupFeature(chatId, 'welcome', enabled);

    await client.sendMessage(
      chatId,
      success(
        'Boas-vindas do grupo',
        `As boas-vindas agora estão ${enabled ? 'ligadas' : 'desligadas'}.`,
      ),
    );
  },
};
