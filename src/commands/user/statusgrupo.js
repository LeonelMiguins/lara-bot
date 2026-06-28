const {
  getAntiFloodSettings,
  getFeatureEntries,
} = require('../../services/groupSettingsService');
const { getFeatureLabelKey } = require('../../services/commands/featureCatalogService');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection } = require('../../utils/respond');

function formatFeatureSummary(groupSettings) {
  const enabledFeatures = getFeatureEntries(groupSettings)
    .filter(([, enabled]) => enabled)
    .map(([featureName]) => {
      const labelKey = getFeatureLabelKey(featureName);
      return labelKey ? getPhrase(labelKey) : featureName;
    });

  if (!enabledFeatures.length) {
    return getPhrase('modules.feature_none_enabled');
  }

  return enabledFeatures.join(', ');
}

module.exports = {
  name: 'statusgrupo',
  aliases: ['grupostatus', 'status'],
  description: 'Mostra um resumo rapido do status atual do grupo.',
  menuExample: `#statusgrupo`,
  help: {
    summary: 'Mostra um resumo rapido do grupo, incluindo membros, admins e modulos ativos.',
    examples: [
      '#statusgrupo',
    ],
    notes: [
      'Exibe tambem o prefixo ativo, o estado do anti-flood e se o link pode ser gerado.',
    ],
  },
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chat, chatName, participants, groupSettings, botIsAdmin, commandPrefix }) {
    const admins = participants.filter(
      (participant) => participant.isAdmin || participant.isSuperAdmin,
    ).length;
    const antiFlood = getAntiFloodSettings(groupSettings);

    await client.sendMessage(
      chatId,
      commandPanel(getPhrase('commands.statusgrupo.title'), {
        sections: [
          createSection(getPhrase('labels.summary'), [
            getPhrase('commands.statusgrupo.group_line', { value: chatName || chat.name || getPhrase('commands.common.no_name') }),
            getPhrase('commands.statusgrupo.members_line', { value: participants.length }),
            getPhrase('commands.statusgrupo.admins_line', { value: admins }),
            getPhrase('commands.statusgrupo.prefix_line', { value: commandPrefix }),
          ]),
          createSection(getPhrase('labels.protection'), [
            getPhrase('commands.statusgrupo.modules_line', { value: formatFeatureSummary(groupSettings) }),
            getPhrase('commands.statusgrupo.link_line', { value: botIsAdmin ? getPhrase('commands.common.yes') : getPhrase('commands.common.no') }),
            getPhrase('commands.statusgrupo.antiflood_line', { value: groupSettings?.features?.antiFlood ? getPhrase('commands.statusgrupo.state_on') : getPhrase('commands.statusgrupo.state_off') }),
            getPhrase('commands.statusgrupo.limit_line', { value: antiFlood.repeatedMessagesThreshold }),
            getPhrase('commands.statusgrupo.window_line', { value: Math.round(antiFlood.windowMs / 1000) }),
          ]),
        ],
      }),
    );
  },
};
