const config = require('../../config/config');
const { loadOwnerSettings, setOwnerNotificationsEnabled } = require('../../services/ownerSettingsService');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, invalidUsage, phraseSuccess } = require('../../utils/respond');

function formatStatus() {
  const enabled = Boolean(loadOwnerSettings().notifications?.enabled);
  return enabled ? '🟢 Ligadas' : '🔴 Desligadas';
}

module.exports = {
  name: 'notificacoes',
  aliases: ['notificacoesdono', 'privado'],
  description: 'Liga ou desliga as notificacoes privadas do dono.',
  menuExample: `${config.prefix}notificacoes on|off`,
  help: {
    summary: 'Liga ou desliga as notificacoes privadas enviadas ao dono do bot.',
    examples: [
      '#notificacoes',
      '#notificacoes on',
      '#notificacoes off',
    ],
    notes: [
      'Comando exclusivo do dono do bot.',
      'Controla avisos como acoes de moderacao e execucoes importantes.',
    ],
  },
  groupOnly: false,
  adminOnly: false,
  ownerOnly: true,
  async execute({ client, chatId, args, commandPrefix }) {
    const action = String(args[0] || '').toLowerCase();

    if (!action || action === 'status' || action === 'list') {
      await client.sendMessage(
        chatId,
        commandPanel(getPhrase('commands.notificacoes.title'), {
          sections: [
            createSection(getPhrase('labels.status'), [
              getPhrase('commands.notificacoes.current_line', { value: formatStatus() }),
            ]),
          ],
          footer: [
            getPhrase('commands.notificacoes.usage_on', { prefix: commandPrefix }),
            getPhrase('commands.notificacoes.usage_off', { prefix: commandPrefix }),
          ],
        }),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.notificacoes.title'), [
          getPhrase('commands.notificacoes.usage_enable', { prefix: commandPrefix }),
          getPhrase('commands.notificacoes.usage_disable', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    const enabled = action === 'on';
    setOwnerNotificationsEnabled(enabled);
    await client.sendMessage(
      chatId,
      phraseSuccess(enabled ? 'success.command_enabled' : 'success.command_disabled', {
        command_name: 'notificacoes',
      }),
    );
  },
};
