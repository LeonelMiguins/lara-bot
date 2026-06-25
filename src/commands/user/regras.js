const config = require('../../config/config');
const {
  addGroupRule,
  getRuleEntries,
  removeGroupRule,
  resetGroupRules,
} = require('../../services/groupSettingsService');
const { error, info, success, warning } = require('../../utils/respond');

function formatRules(groupSettings) {
  return getRuleEntries(groupSettings)
    .map((rule, index) => `🚫 ${index + 1}. ${rule}`)
    .join('\n');
}

module.exports = {
  name: 'regras',
  aliases: ['rules'],
  description: 'Mostra as regras do grupo.',
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, chatName, groupSettings, senderIsAdmin, args }) {
    if (!args.length) {
      await client.sendMessage(chatId, info(`Regras de ${chatName || 'grupo'}`, formatRules(groupSettings)));
      return;
    }

    if (!senderIsAdmin) {
      await client.sendMessage(
        chatId,
        error('Regras do grupo', 'Apenas administradores podem editar as regras.'),
      );
      return;
    }

    const action = String(args[0] || '').toLowerCase();

    if (action === 'add') {
      const text = args.slice(1).join(' ').trim();
      if (!text) {
        await client.sendMessage(
          chatId,
          warning('Regras do grupo', `Use *${config.prefix}regras add <texto da regra>*.`),
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
          warning('Regras do grupo', `Use *${config.prefix}regras del <numero>*. Exemplo: *${config.prefix}regras del 2*.`),
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
      await client.sendMessage(chatId, info(`Regras de ${chatName || 'grupo'}`, formatRules(groupSettings)));
      return;
    }

    await client.sendMessage(
      chatId,
      warning(
        'Regras do grupo',
        [
          `Use *${config.prefix}regras* para ver as regras.`,
          `Use *${config.prefix}regras add <texto>* para adicionar.`,
          `Use *${config.prefix}regras del <numero>* para remover.`,
          `Use *${config.prefix}regras reset* para restaurar o padrao.`,
        ].join('\n'),
      ),
    );
  },
};
