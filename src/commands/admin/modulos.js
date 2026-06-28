const config = require('../../config/config');
const {
  getFeatureEntries,
  isKnownFeature,
  setGroupFeature,
} = require('../../services/groupSettingsService');
const { commandPanel, createSection, error, invalidUsage, phraseSuccess } = require('../../utils/respond');

const FEATURE_LABELS = {
  welcome: 'Boas-vindas',
  farewell: 'Saida de membros',
  antiLink: 'Anti-link',
  antiFlood: 'Anti-flood',
  commandReaction: 'Reacao em comandos',
};

function formatFeatureStatus(featureName, enabled) {
  const emoji = enabled ? '✅' : '❌';
  const label = FEATURE_LABELS[featureName] || featureName;
  const state = enabled ? 'ligado' : 'desligado';
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
    if (!args.length) {
      await client.sendMessage(chatId, commandPanel('Modulos do bot', {
        sections: [
          createSection(
            'Status dos Modulos',
            getFeatureEntries(groupConfig).map(([featureName, enabled]) =>
              formatFeatureStatus(featureName, enabled),
            ),
          ),
        ],
        footer: [
          `Use *${commandPrefix}modulos <nome> on* para ligar.`,
          `Use *${commandPrefix}modulos <nome> off* para desligar.`,
          '',
          'Nomes aceitos: welcome, farewell, antiLink, antiFlood, commandReaction',
        ],
      }));
      return;
    }

    const featureName = args[0];
    const action = (args[1] || '').toLowerCase();

    if (!isKnownFeature(featureName)) {
      await client.sendMessage(
        chatId,
        error(
          'Modulos do bot',
          'Modulo desconhecido. Use: welcome, farewell, antiLink, antiFlood ou commandReaction.',
        ),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage('Modulos do bot', [
          `Use *${commandPrefix}modulos ${featureName} on* para ligar esse modulo.`,
          `Use *${commandPrefix}modulos ${featureName} off* para desligar esse modulo.`,
        ]),
      );
      return;
    }

    const enabled = action === 'on';
    setGroupFeature(chatId, featureName, enabled);

    await client.sendMessage(
      chatId,
      phraseSuccess(enabled ? 'success.module_enabled' : 'success.module_disabled', {
        module_name: FEATURE_LABELS[featureName] || featureName,
      }),
    );
  },
};
