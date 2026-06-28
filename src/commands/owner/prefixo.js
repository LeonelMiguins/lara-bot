const {
  loadGroupSettings,
} = require('../../services/groupSettingsService');
const {
  getDefaultPrefix,
  getGlobalPrefix,
  getGroupPrefix,
  getPrefixSummary,
  resetGlobalPrefix,
  resetGroupPrefix,
  setGlobalPrefix,
  setGroupPrefix,
  validatePrefix,
} = require('../../services/prefixService');
const { denied, info, invalidUsage, success, warning } = require('../../utils/respond');
const { normalizeChatId } = require('../../utils/wweb');

function parseTargetGroupArgs(args) {
  const nextArgs = [...args];
  const flagIndex = nextArgs.findIndex((arg) => ['--grupo', '--group', '-g'].includes(String(arg).toLowerCase()));

  if (flagIndex === -1) {
    return { targetGroupId: '', args: nextArgs };
  }

  const rawGroupId = normalizeChatId(nextArgs[flagIndex + 1] || '');
  const targetGroupId = rawGroupId.endsWith('@g.us') ? rawGroupId : `${rawGroupId.replace(/@.+$/i, '')}@g.us`;
  nextArgs.splice(flagIndex, 2);

  return {
    targetGroupId,
    args: nextArgs,
  };
}

function buildStatusBody({ commandPrefix, groupSettings = null, showGroup = false, targetGroupId = '' }) {
  const summary = getPrefixSummary(groupSettings);
  const lines = [
    `Prefixo padrao da base: ${summary.defaultPrefix}`,
    `Prefixo global: ${summary.globalPrefix}`,
  ];

  if (showGroup) {
    lines.push(`Grupo alvo: ${targetGroupId || groupSettings?.groupId || 'nao informado'}`);
    lines.push(`Prefixo do grupo: ${summary.groupPrefix || '(herdando o global)'}`);
    lines.push(`Prefixo efetivo no grupo: ${summary.effectivePrefix}`);
  }

  lines.push('');
  lines.push(`Use *${commandPrefix}prefixo global <novo>* para trocar o prefixo global.`);
  lines.push(`Use *${commandPrefix}prefixo global reset* para voltar ao padrao.`);
  lines.push(`Use *${commandPrefix}prefixo grupo <novo>* dentro do grupo para sobrescrever.`);
  lines.push(`Use *${commandPrefix}prefixo grupo reset* para o grupo voltar a herdar o global.`);

  return lines.join('\n');
}

module.exports = {
  name: 'prefixo',
  aliases: ['prefix', 'setprefix'],
  description: 'Mostra ou altera o prefixo global e por grupo.',
  menuExamples: [
    '#prefixo status',
    '#prefixo global !',
    '#prefixo grupo !',
  ],
  groupOnly: false,
  adminOnly: false,
  ownerOnly: false,
  async execute(context) {
    const {
      client,
      chatId,
      args,
      isGroup,
      senderIsAdmin,
      senderIsOwner,
      groupSettings,
      commandPrefix,
    } = context;

    const parsed = parseTargetGroupArgs(args);
    const scope = String(parsed.args[0] || 'status').toLowerCase();
    const action = String(parsed.args[1] || '').trim();

    const privateTargetGroupId = !isGroup && senderIsOwner ? parsed.targetGroupId : '';
    const targetGroupId = isGroup ? chatId : privateTargetGroupId;
    const targetGroupSettings = targetGroupId ? loadGroupSettings(targetGroupId) : null;
    const currentGroupSettings = isGroup ? groupSettings : targetGroupSettings;

    if (!parsed.args.length || scope === 'status' || scope === 'list') {
      await client.sendMessage(
        chatId,
        info(
          'Prefixo do bot',
          buildStatusBody({
            commandPrefix,
            groupSettings: currentGroupSettings,
            showGroup: Boolean(currentGroupSettings),
            targetGroupId,
          }),
        ),
      );
      return;
    }

    if (scope === 'global') {
      if (!senderIsOwner) {
        await client.sendMessage(
          chatId,
          denied('Prefixo do bot', 'Apenas o dono do bot pode alterar o prefixo global.', [
            'Use esse comando no privado do numero principal do bot.',
          ]),
        );
        return;
      }

      if (!action || action === 'status') {
        await client.sendMessage(
          chatId,
          info(
            'Prefixo global',
            [
              `Atual: ${getGlobalPrefix()}`,
              `Padrao da base: ${getDefaultPrefix()}`,
              '',
              `Use *${commandPrefix}prefixo global <novo>* para trocar.`,
              `Use *${commandPrefix}prefixo global reset* para restaurar.`,
            ].join('\n'),
          ),
        );
        return;
      }

      if (action === 'reset') {
        const nextPrefix = resetGlobalPrefix();
        await client.sendMessage(chatId, success('Prefixo global', `O prefixo global voltou para *${nextPrefix}*.`));
        return;
      }

      try {
        const nextPrefix = setGlobalPrefix(action);
        await client.sendMessage(chatId, success('Prefixo global', `O prefixo global agora e *${nextPrefix}*.`));
      } catch (exception) {
        await client.sendMessage(chatId, warning('Prefixo global', exception.message));
      }
      return;
    }

    if (scope === 'grupo') {
      const canManageGroupPrefix = (isGroup && senderIsAdmin) || senderIsOwner;

      if (!canManageGroupPrefix) {
        await client.sendMessage(
          chatId,
          denied('Prefixo do grupo', 'Apenas administradores ou o dono do bot podem alterar o prefixo do grupo.', [
            'Use esse comando com uma conta administradora do grupo.',
            'Ou use o privado do dono com --grupo <ID_DO_GRUPO>.',
          ]),
        );
        return;
      }

      if (!targetGroupId) {
        await client.sendMessage(
          chatId,
          invalidUsage('Prefixo do grupo', [
            'Use esse comando dentro de um grupo.',
            'Ou informe *--grupo <ID_DO_GRUPO>* no privado do dono.',
          ]),
        );
        return;
      }

      if (!action || action === 'status') {
        await client.sendMessage(
          chatId,
          info(
            'Prefixo do grupo',
            [
              `Grupo: ${targetGroupId}`,
              `Prefixo do grupo: ${getGroupPrefix(currentGroupSettings) || '(herdando o global)'}`,
              `Prefixo efetivo: ${getPrefixSummary(currentGroupSettings).effectivePrefix}`,
              '',
              `Use *${commandPrefix}prefixo grupo <novo>* para sobrescrever.`,
              `Use *${commandPrefix}prefixo grupo reset* para herdar o global.`,
            ].join('\n'),
          ),
        );
        return;
      }

      if (action === 'reset') {
        resetGroupPrefix(targetGroupId);
        await client.sendMessage(
          chatId,
          success('Prefixo do grupo', 'O grupo voltou a herdar o prefixo global do bot.'),
        );
        return;
      }

      try {
        const nextPrefix = validatePrefix(action);
        setGroupPrefix(targetGroupId, nextPrefix);
        await client.sendMessage(chatId, success('Prefixo do grupo', `O prefixo desse grupo agora e *${nextPrefix}*.`));
      } catch (exception) {
        await client.sendMessage(chatId, warning('Prefixo do grupo', exception.message));
      }
      return;
    }

    await client.sendMessage(
      chatId,
      invalidUsage('Prefixo do bot', [
        `Use *${commandPrefix}prefixo status* para ver a situacao atual.`,
        `Use *${commandPrefix}prefixo global <novo>* para trocar o prefixo global.`,
        `Use *${commandPrefix}prefixo grupo <novo>* para trocar apenas o grupo atual.`,
      ]),
    );
  },
};
