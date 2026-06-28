const config = require('../../config/config');
const { resolveWelcomeCommand } = require('../../services/commands/groupFeatureCommandService');
const { getPhrase } = require('../../services/messagePhraseService');
const { info, invalidUsage, phraseSuccess } = require('../../utils/respond');

module.exports = {
  name: 'boasvindas',
  aliases: ['welcome', 'bemvindo', 'bemvindos'],
  description: 'Liga ou desliga as boas-vindas automáticas do grupo.',
  menuExample: `${config.prefix}boasvindas on|off`,
  help: {
    summary: 'Liga ou desliga a mensagem automatica de boas-vindas do grupo.',
    examples: [
      '#boasvindas',
      '#boasvindas on',
      '#boasvindas off',
    ],
    notes: [
      'O estado do modulo fica salvo por grupo.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings, commandPrefix }) {
    const result = resolveWelcomeCommand({ chatId, args, groupSettings });

    if (result.status === 'show_status') {
      await client.sendMessage(
        chatId,
        info(
          getPhrase('commands.boasvindas.title'),
          [
            getPhrase('commands.boasvindas.status_line', {
              status: result.enabled ? getPhrase('commands.common.status_on') : getPhrase('commands.common.status_off'),
            }),
            '',
            getPhrase('commands.boasvindas.usage_on', { prefix: commandPrefix }),
            getPhrase('commands.boasvindas.usage_off', { prefix: commandPrefix }),
          ].join('\n'),
        ),
      );
      return;
    }

    if (result.status === 'invalid_action') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.boasvindas.title'), [
          getPhrase('commands.boasvindas.usage_on', { prefix: commandPrefix }),
          getPhrase('commands.boasvindas.usage_off', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      phraseSuccess(result.enabled ? 'success.module_enabled' : 'success.module_disabled', {
        module_name: getPhrase('modules.feature_welcome'),
      }),
    );
  },
};
