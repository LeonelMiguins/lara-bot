const config = require('../../config/config');
const { resolveModulesCommand } = require('../../services/commands/groupFeatureCommandService');
const { getFeatureLabelKey } = require('../../services/commands/featureCatalogService');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, error, invalidUsage, phraseSuccess } = require('../../utils/respond');

function formatFeatureStatus(featureName, enabled) {
  const emoji = enabled ? '✅' : '❌';
  const labelKey = getFeatureLabelKey(featureName);
  const label = labelKey ? getPhrase(labelKey) : featureName;
  const state = enabled ? getPhrase('commands.statusgrupo.state_on') : getPhrase('commands.statusgrupo.state_off');
  return `${emoji} ${label}: ${state}`;
}

module.exports = {
  name: 'modulos',
  aliases: ['modules', 'features'],
  description: 'Lista e controla os modulos automáticos do bot.',
  menuExamples: [
    `${config.prefix}modulos`,
    `${config.prefix}modulos antiFlood on`,
  ],
  help: {
    summary: 'Lista os modulos automaticos do grupo e permite ligar ou desligar cada um.',
    examples: [
      '#modulos',
      '#modulos welcome on',
      '#modulos farewell off',
      '#modulos antiLink on',
      '#modulos antiFlood off',
      '#modulos commandReaction on',
    ],
    notes: [
      'Os nomes tecnicos aceitos sao: welcome, farewell, antiLink, antiFlood e commandReaction.',
      'As alteracoes ficam salvas por grupo.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupConfig, commandPrefix }) {
    const result = resolveModulesCommand({ chatId, args, groupConfig });

    if (result.status === 'show_status') {
      await client.sendMessage(chatId, commandPanel(getPhrase('commands.modulos.title'), {
        sections: [
          createSection(
            getPhrase('labels.module_status'),
            result.entries.map(([featureName, enabled]) =>
              formatFeatureStatus(featureName, enabled),
            ),
          ),
        ],
        footer: [
          getPhrase('commands.modulos.usage_on', { prefix: commandPrefix }),
          getPhrase('commands.modulos.usage_off', { prefix: commandPrefix }),
          '',
          getPhrase('commands.modulos.accepted_names'),
        ],
      }));
      return;
    }

    if (result.status === 'unknown_feature') {
      await client.sendMessage(
        chatId,
        error(
          getPhrase('commands.modulos.title'),
          getPhrase('commands.modulos.unknown_module'),
        ),
      );
      return;
    }

    if (result.status === 'invalid_action') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.modulos.title'), [
          getPhrase('commands.modulos.usage_module_on', { prefix: commandPrefix, module: result.featureName }),
          getPhrase('commands.modulos.usage_module_off', { prefix: commandPrefix, module: result.featureName }),
        ]),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      phraseSuccess(result.enabled ? 'success.module_enabled' : 'success.module_disabled', {
        module_name: getPhrase(getFeatureLabelKey(result.featureName)),
      }),
    );
  },
};
