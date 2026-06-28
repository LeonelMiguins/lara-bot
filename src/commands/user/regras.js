const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const {
  addGroupRule,
  getRuleEntries,
  removeGroupRule,
  resetGroupRules,
} = require('../../services/groupSettingsService');
const { commandPanel, createSection, denied, invalidUsage, success } = require('../../utils/respond');

function formatRules(groupSettings) {
  return getRuleEntries(groupSettings).map((rule, index) => `🚫 ${index + 1}. ${rule}`);
}

module.exports = {
  name: 'regras',
  aliases: ['rules'],
  description: 'Mostra as regras do grupo.',
  menuExamples: [
    `${config.prefix}regras`,
    `${config.prefix}regras add <texto>`,
  ],
  help: {
    summary: 'Mostra as regras do grupo e permite editar a lista quando usado por administradores.',
    examples: [
      '#regras',
      '#regras list',
      '#regras add Respeite todos os membros.',
      '#regras del 2',
      '#regras reset',
    ],
    notes: [
      'Qualquer membro pode consultar as regras.',
      'Somente administradores podem adicionar, remover ou resetar.',
    ],
  },
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chatName, groupSettings, senderIsAdmin, args, commandPrefix }) {
    const panelTitle = getPhrase('commands.regras.title', {
      group_name: chatName || getPhrase('commands.regras.group_fallback'),
    });

    if (!args.length) {
      await client.sendMessage(chatId, commandPanel(panelTitle, {
        sections: [
          createSection(getPhrase('labels.rules'), formatRules(groupSettings)),
        ],
      }));
      return;
    }

    if (!senderIsAdmin) {
      await client.sendMessage(
        chatId,
        denied(panelTitle, getPhrase('commands.regras.denied_reason'), [
          getPhrase('commands.regras.denied_action'),
        ]),
      );
      return;
    }

    const action = String(args[0] || '').toLowerCase();

    if (action === 'add') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await client.sendMessage(
          chatId,
          invalidUsage(panelTitle, [
            getPhrase('commands.regras.usage_add', { prefix: commandPrefix }),
          ]),
        );
        return;
      }

      addGroupRule(chatId, text);
      await client.sendMessage(chatId, success(panelTitle, getPhrase('commands.regras.rule_added')));
      return;
    }

    if (action === 'del' || action === 'rm' || action === 'remove') {
      const rules = getRuleEntries(groupSettings);
      const index = Number(args[1]) - 1;

      if (!Number.isInteger(index) || index < 0 || index >= rules.length) {
        await client.sendMessage(
          chatId,
          invalidUsage(panelTitle, [
            getPhrase('commands.regras.usage_del', { prefix: commandPrefix }),
            getPhrase('commands.regras.usage_del_example', { prefix: commandPrefix }),
          ]),
        );
        return;
      }

      removeGroupRule(chatId, index);
      await client.sendMessage(chatId, success(panelTitle, getPhrase('commands.regras.rule_removed')));
      return;
    }

    if (action === 'reset') {
      resetGroupRules(chatId);
      await client.sendMessage(chatId, success(panelTitle, getPhrase('commands.regras.rules_reset')));
      return;
    }

    if (action === 'list') {
      await client.sendMessage(chatId, commandPanel(panelTitle, {
        sections: [
          createSection(getPhrase('labels.rules'), formatRules(groupSettings)),
        ],
      }));
      return;
    }

    await client.sendMessage(
      chatId,
      invalidUsage(panelTitle, [
        getPhrase('commands.regras.usage_view', { prefix: commandPrefix }),
        getPhrase('commands.regras.usage_add_short', { prefix: commandPrefix }),
        getPhrase('commands.regras.usage_del_short', { prefix: commandPrefix }),
        getPhrase('commands.regras.usage_reset', { prefix: commandPrefix }),
      ]),
    );
  },
};
