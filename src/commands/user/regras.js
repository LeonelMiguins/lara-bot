const config = require('../../config/config');
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
    if (!args.length) {
      await client.sendMessage(chatId, commandPanel(`Regras de ${chatName || 'grupo'}`, {
        sections: [
          createSection('Regras', formatRules(groupSettings)),
        ],
      }));
      return;
    }

    if (!senderIsAdmin) {
      await client.sendMessage(
        chatId,
        denied('Regras do grupo', 'Apenas administradores podem editar as regras.', [
          'Use esse comando com uma conta administradora do grupo.',
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
          invalidUsage('Regras do grupo', [
            `Use *${commandPrefix}regras add <texto da regra>*.`,
          ]),
        );
        return;
      }

      addGroupRule(chatId, text);
      await client.sendMessage(chatId, success('Regras do grupo', 'Nova regra adicionada com sucesso.'));
      return;
    }

    if (action === 'del' || action === 'rm' || action === 'remove') {
      const rules = getRuleEntries(groupSettings);
      const index = Number(args[1]) - 1;

      if (!Number.isInteger(index) || index < 0 || index >= rules.length) {
        await client.sendMessage(
          chatId,
          invalidUsage('Regras do grupo', [
            `Use *${commandPrefix}regras del <numero>*.`,
            `Exemplo: *${commandPrefix}regras del 2*.`,
          ]),
        );
        return;
      }

      removeGroupRule(chatId, index);
      await client.sendMessage(chatId, success('Regras do grupo', 'Regra removida com sucesso.'));
      return;
    }

    if (action === 'reset') {
      resetGroupRules(chatId);
      await client.sendMessage(chatId, success('Regras do grupo', 'As regras voltaram para o padrao da base.'));
      return;
    }

    if (action === 'list') {
      await client.sendMessage(chatId, commandPanel(`Regras de ${chatName || 'grupo'}`, {
        sections: [
          createSection('Regras', formatRules(groupSettings)),
        ],
      }));
      return;
    }

    await client.sendMessage(
      chatId,
      invalidUsage('Regras do grupo', [
        `Use *${commandPrefix}regras* para ver as regras.`,
        `Use *${commandPrefix}regras add <texto>* para adicionar.`,
        `Use *${commandPrefix}regras del <numero>* para remover.`,
        `Use *${commandPrefix}regras reset* para restaurar o padrao.`,
      ]),
    );
  },
};
