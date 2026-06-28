const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
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
        : getPhrase('commands.blacklist.empty_entries');

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
          getPhrase('commands.blacklist.title'),
          [
            formatBlacklist(groupSettings),
            '',
            getPhrase('commands.blacklist.usage_remove', { prefix: commandPrefix }),
            getPhrase('commands.blacklist.usage_reset', { prefix: commandPrefix }),
            getPhrase('commands.blacklist.edit_json'),
            getPhrase('commands.blacklist.categories'),
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
        error(getPhrase('commands.blacklist.title'), getPhrase('commands.blacklist.category_invalid')),
      );
      return;
    }

    if (action === 'del' || action === 'rm' || action === 'remove') {
      const matcher = args.slice(2).join(' ').trim();
      const entries = getBlacklistEntries(groupSettings, category);

      if (!matcher) {
        await client.sendMessage(
          chatId,
          invalidUsage(getPhrase('commands.blacklist.title'), [
            getPhrase('commands.blacklist.missing_entry_usage', {
              prefix: commandPrefix,
              category: args[1] || '<categoria>',
            }),
          ]),
        );
        return;
      }

      const numericIndex = Number(matcher) - 1;
      if (Number.isInteger(numericIndex) && numericIndex >= 0 && numericIndex < entries.length) {
        removeBlacklistEntry(chatId, category, numericIndex);
        await client.sendMessage(chatId, success(getPhrase('commands.blacklist.title'), getPhrase('commands.blacklist.entry_removed')));
        return;
      }

      if (!entries.includes(matcher.toLowerCase())) {
        await client.sendMessage(chatId, error(getPhrase('commands.blacklist.title'), getPhrase('commands.blacklist.entry_not_found')));
        return;
      }

      removeBlacklistEntry(chatId, category, matcher);
      await client.sendMessage(chatId, success(getPhrase('commands.blacklist.title'), getPhrase('commands.blacklist.entry_removed')));
      return;
    }

    if (action === 'reset') {
      resetBlacklistCategory(chatId, category);
      await client.sendMessage(
        chatId,
        success(getPhrase('commands.blacklist.title'), getPhrase('commands.blacklist.category_restored', {
          category_name: formatCategoryName(category),
        })),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      invalidUsage(getPhrase('commands.blacklist.title'), [
        getPhrase('commands.blacklist.usage_list', { prefix: commandPrefix }),
        getPhrase('commands.blacklist.usage_remove_generic', { prefix: commandPrefix }),
        getPhrase('commands.blacklist.usage_reset_generic', { prefix: commandPrefix }),
        getPhrase('commands.blacklist.edit_json_short'),
      ]),
    );
  },
};
