const config = require('../../config/config');
const {
  getBlacklistCategoryMeta,
  getBlacklistEntries,
  normalizeBlacklistCategory,
  removeBlacklistEntry,
  resetBlacklistCategory,
} = require('../../services/groupSettingsService');
const { error, info, invalidUsage, success } = require('../../utils/respond');

function formatCategoryName(category) {
  return getBlacklistCategoryMeta()[category]?.label || category;
}

function formatBlacklist(groupSettings) {
  const categories = getBlacklistCategoryMeta();

  return Object.keys(categories)
    .map((category) => {
      const entries = getBlacklistEntries(groupSettings, category);
      const content = entries.length
        ? entries.map((entry, index) => `${index + 1}. ${entry}`).join('\n')
        : 'Sem entradas personalizadas.';

      return [`*${formatCategoryName(category)}*`, content].join('\n');
    })
    .join('\n\n');
}

module.exports = {
  name: 'blacklist',
  aliases: ['bloqueios'],
  description: 'Lista a blacklist do grupo e permite remover entradas existentes.',
  menuExamples: [
    `${config.prefix}blacklist`,
  ],
  help: {
    summary: 'Lista a blacklist do grupo e permite remover ou restaurar entradas.',
    examples: [
      '#blacklist',
      '#blacklist del adulto 1',
      '#blacklist del apostas bet365',
      '#blacklist reset adulto',
    ],
    notes: [
      'Novas palavras-chave devem ser adicionadas direto no JSON do grupo.',
      'As categorias aceitas sao: whatsapp, adulto e apostas.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings, commandPrefix }) {
    if (!args.length || String(args[0]).toLowerCase() === 'list') {
      await client.sendMessage(
        chatId,
        info(
          'Blacklist do grupo',
          [
            formatBlacklist(groupSettings),
            '',
            `Use *${commandPrefix}blacklist del <categoria> <numero|dominio>* para remover.`,
            `Use *${commandPrefix}blacklist reset <categoria>* para restaurar o padrao.`,
            'Para adicionar novas palavras-chave, edite o JSON do grupo diretamente.',
            'Categorias: whatsapp, adulto, apostas',
          ].join('\n'),
        ),
      );
      return;
    }

    const action = String(args[0] || '').toLowerCase();
    const category = normalizeBlacklistCategory(args[1]);

    if (!category) {
      await client.sendMessage(
        chatId,
        error('Blacklist do grupo', 'Categoria invalida. Use: whatsapp, adulto ou apostas.'),
      );
      return;
    }

    if (action === 'del' || action === 'rm' || action === 'remove') {
      const matcher = args.slice(2).join(' ').trim();
      const entries = getBlacklistEntries(groupSettings, category);

      if (!matcher) {
        await client.sendMessage(
          chatId,
          invalidUsage('Blacklist do grupo', [
            `Use *${commandPrefix}blacklist del ${args[1] || '<categoria>'} <numero|dominio>*.`,
          ]),
        );
        return;
      }

      const numericIndex = Number(matcher) - 1;
      if (Number.isInteger(numericIndex) && numericIndex >= 0 && numericIndex < entries.length) {
        removeBlacklistEntry(chatId, category, numericIndex);
        await client.sendMessage(chatId, success('Blacklist do grupo', 'Entrada removida com sucesso.'));
        return;
      }

      if (!entries.includes(matcher.toLowerCase())) {
        await client.sendMessage(chatId, error('Blacklist do grupo', 'Nao encontrei essa entrada na categoria informada.'));
        return;
      }

      removeBlacklistEntry(chatId, category, matcher);
      await client.sendMessage(chatId, success('Blacklist do grupo', 'Entrada removida com sucesso.'));
      return;
    }

    if (action === 'reset') {
      resetBlacklistCategory(chatId, category);
      await client.sendMessage(
        chatId,
        success('Blacklist do grupo', `${formatCategoryName(category)} voltou para o padrao da base.`),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      invalidUsage('Blacklist do grupo', [
        `Use *${commandPrefix}blacklist* para listar.`,
        `Use *${commandPrefix}blacklist del <categoria> <numero|dominio>* para remover.`,
        `Use *${commandPrefix}blacklist reset <categoria>* para restaurar o padrao.`,
        'Novas palavras-chave devem ser adicionadas direto no JSON do grupo.',
      ]),
    );
  },
};
