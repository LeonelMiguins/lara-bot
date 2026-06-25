const config = require('../../config/config');
const { setGroupFeature } = require('../../services/groupSettingsService');
const { info, success, warning } = require('../../utils/respond');

function formatStatus(groupSettings) {
  const enabled = Boolean(groupSettings?.features?.antiLink);
  return enabled ? '🟢 Ligado' : '🔴 Desligado';
}

module.exports = {
  name: 'antilink',
  aliases: ['antilinks'],
  description: 'Liga ou desliga o anti-link do grupo.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings }) {
    const action = String(args[0] || '').toLowerCase();

    if (!action || action === 'list' || action === 'status') {
      await client.sendMessage(
        chatId,
        info(
          'Anti-link do grupo',
          [
            `Status atual: ${formatStatus(groupSettings)}`,
            '',
            `Use *${config.prefix}antilink on* para ligar.`,
            `Use *${config.prefix}antilink off* para desligar.`,
          ].join('\n'),
        ),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        warning(
          'Anti-link do grupo',
          `Use *${config.prefix}antilink on* para ligar ou *${config.prefix}antilink off* para desligar.`,
        ),
      );
      return;
    }

    const enabled = action === 'on';
    setGroupFeature(chatId, 'antiLink', enabled);

    await client.sendMessage(
      chatId,
      success(
        'Anti-link do grupo',
        `O anti-link agora está ${enabled ? 'ligado' : 'desligado'}.`,
      ),
    );
  },
};
