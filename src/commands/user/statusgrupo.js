const {
  getAntiFloodSettings,
  getFeatureEntries,
} = require('../../services/groupSettingsService');
const { commandPanel, createSection } = require('../../utils/respond');

const FEATURE_LABELS = {
  welcome: 'Boas-vindas',
  farewell: 'Saida de membros',
  antiLink: 'Anti-link',
  antiFlood: 'Anti-flood',
  commandReaction: 'Reacao em comandos',
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
      commandPanel('Status do grupo', {
        sections: [
          createSection('Resumo', [
            `Grupo: ${chatName || chat.name || 'Sem nome'}`,
            `Membros: ${participants.length}`,
            `Admins: ${admins}`,
            `Prefixo ativo: ${commandPrefix}`,
          ]),
          createSection('Protecao', [
            `Modulos ligados: ${formatFeatureSummary(groupSettings)}`,
            `Link liberado: ${botIsAdmin ? 'sim' : 'nao'}`,
            `Anti-flood: ${groupSettings?.features?.antiFlood ? 'ligado' : 'desligado'}`,
            `Limite atual: ${antiFlood.repeatedMessagesThreshold} repeticoes`,
            `Janela atual: ${Math.round(antiFlood.windowMs / 1000)}s`,
          ]),
        ],
      }),
    );
  },
};
