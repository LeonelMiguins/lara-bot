const {
  getAntiFloodSettings,
  getFeatureEntries,
} = require('../../services/groupSettingsService');
const { info } = require('../../utils/respond');

const FEATURE_LABELS = {
  welcome: 'Boas-vindas',
  farewell: 'Saida de membros',
  antiLink: 'Anti-link',
  antiFlood: 'Anti-flood',
};

function formatFeatureSummary(groupSettings) {
  const enabledFeatures = getFeatureEntries(groupSettings)
    .filter(([, enabled]) => enabled)
    .map(([featureName]) => FEATURE_LABELS[featureName] || featureName);

  if (!enabledFeatures.length) {
    return 'Nenhum modulo ligado';
  }

  return enabledFeatures.join(', ');
}

module.exports = {
  name: 'statusgrupo',
  aliases: ['grupostatus', 'status'],
  description: 'Mostra um resumo rapido do status atual do grupo.',
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chat, chatName, participants, groupSettings, botIsAdmin }) {
    const admins = participants.filter(
      (participant) => participant.isAdmin || participant.isSuperAdmin,
    ).length;
    const antiFlood = getAntiFloodSettings(groupSettings);

    await client.sendMessage(
      chatId,
      info(
        'Status do grupo',
        [
          `Grupo: ${chatName || chat.name || 'Sem nome'}`,
          `Membros: ${participants.length}`,
          `Admins: ${admins}`,
          `Modulos ligados: ${formatFeatureSummary(groupSettings)}`,
          `Link liberado: ${botIsAdmin ? 'sim' : 'nao'}`,
          `Anti-flood: ${groupSettings?.features?.antiFlood ? 'ligado' : 'desligado'}`,
          `Limite atual: ${antiFlood.repeatedMessagesThreshold} repeticoes`,
          `Janela atual: ${Math.round(antiFlood.windowMs / 1000)}s`,
        ].join('\n'),
      ),
    );
  },
};
