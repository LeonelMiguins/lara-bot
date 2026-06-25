const config = require('../../config/config');
const {
  getFeatureEntries,
  isKnownFeature,
  setGroupFeature,
} = require('../../services/groupSettingsService');
const { error, info, success, warning } = require('../../utils/respond');

const FEATURE_LABELS = {
  welcome: 'Boas-vindas',
  antiLink: 'Anti-link',
  antiFlood: 'Anti-flood',
};

function formatFeatureStatus(featureName, enabled) {
  const emoji = enabled ? '🟢' : '🔴';
  const label = FEATURE_LABELS[featureName] || featureName;
  const state = enabled ? 'ligado' : 'desligado';
  return `${emoji} ${label}: ${state}`;
}

module.exports = {
  name: 'modulos',
  aliases: ['modules', 'features'],
  description: 'Lista e controla os modulos automáticos do bot.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupConfig }) {
    if (!args.length) {
      const body = [
        '*Modulos automáticos*',
        '',
        ...getFeatureEntries(groupConfig).map(([featureName, enabled]) =>
          formatFeatureStatus(featureName, enabled),
        ),
        '',
        `Use *${config.prefix}modulos <nome> on* para ligar.`,
        `Use *${config.prefix}modulos <nome> off* para desligar.`,
        '',
        'Nomes aceitos: welcome, antiLink, antiFlood',
      ].join('\n');

      await client.sendMessage(chatId, info('Modulos do bot', body));
      return;
    }

    const featureName = args[0];
    const action = (args[1] || '').toLowerCase();

    if (!isKnownFeature(featureName)) {
      await client.sendMessage(
        chatId,
        error(
          'Modulos do bot',
          'Modulo desconhecido. Use: welcome, antiLink ou antiFlood.',
        ),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        warning(
          'Modulos do bot',
          `Use *${config.prefix}modulos ${featureName} on* ou *${config.prefix}modulos ${featureName} off*.`,
        ),
      );
      return;
    }

    const enabled = action === 'on';
    setGroupFeature(chatId, featureName, enabled);

    await client.sendMessage(
      chatId,
      success(
        'Modulos do bot',
        `${FEATURE_LABELS[featureName] || featureName} agora está ${enabled ? 'ligado' : 'desligado'}.`,
      ),
    );
  },
};
