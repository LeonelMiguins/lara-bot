const config = require('../../config/config');
const { resolveAntiLinkCommand } = require('../../services/commands/groupProtectionCommandService');
const { getPhrase } = require('../../services/messagePhraseService');
const { error, info, invalidUsage, success } = require('../../utils/respond');

function formatStatus(groupSettings) {
  const enabled = Boolean(groupSettings?.features?.antiLink);
  return enabled ? getPhrase('commands.common.status_on') : getPhrase('commands.common.status_off');
}

function formatAction(action) {
  return action === 'ban' ? 'apagar e banir' : 'apenas apagar';
}

function formatTargetMode(targetMode) {
  return targetMode === 'all'
    ? 'all (apaga mensagem de qualquer um)'
    : 'users (admins e dono ficam imunes)';
}

module.exports = {
  name: 'antilink',
  aliases: ['antilinks'],
  description: 'Liga ou desliga o anti-link do grupo.',
  menuExamples: [
    `${config.prefix}antilink on|off`,
    `${config.prefix}antilink all|users`,
    `${config.prefix}antilink acao whatsapp apagar|banir`,
  ],
  help: {
    summary: 'Liga, desliga e configura o anti-link do grupo.',
    examples: [
      '#antilink',
      '#antilink on',
      '#antilink off',
      '#antilink all',
      '#antilink users',
      '#antilink acao whatsapp apagar',
      '#antilink acao adulto banir',
      '#antilink reset whatsapp',
      '#antilink reset modo',
    ],
    notes: [
      'Modo all apaga mensagem de qualquer pessoa.',
      'Modo users deixa administradores e dono do bot imunes.',
      'As categorias aceitas sao: whatsapp, adulto e apostas.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings, commandPrefix }) {
    const result = resolveAntiLinkCommand({ chatId, args, groupSettings });

    if (result.status === 'show_status') {
      await client.sendMessage(
        chatId,
        info(
          getPhrase('commands.antilink.title'),
          [
            getPhrase('commands.antilink.status_line', { status: formatStatus(groupSettings) }),
            getPhrase('commands.antilink.scope_line', { value: formatTargetMode(result.antiLinkSettings.targetMode) }),
            getPhrase('commands.antilink.whatsapp_line', { value: formatAction(result.antiLinkSettings.whatsappGroupLinks) }),
            getPhrase('commands.antilink.adult_line', { value: formatAction(result.antiLinkSettings.adultSites) }),
            getPhrase('commands.antilink.bets_line', { value: formatAction(result.antiLinkSettings.betsSites) }),
            '',
            getPhrase('commands.antilink.usage_on', { prefix: commandPrefix }),
            getPhrase('commands.antilink.usage_off', { prefix: commandPrefix }),
            getPhrase('commands.antilink.usage_all', { prefix: commandPrefix }),
            getPhrase('commands.antilink.usage_users', { prefix: commandPrefix }),
            getPhrase('commands.antilink.usage_action', { prefix: commandPrefix }),
          ].join('\n'),
        ),
      );
      return;
    }

    if (result.status === 'invalid_category') {
      await client.sendMessage(
        chatId,
        error(getPhrase('commands.antilink.title'), getPhrase('commands.antilink.category_invalid')),
      );
      return;
    }

    if (result.status === 'missing_action_mode') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.antilink.title'), [
          getPhrase('commands.antilink.usage_action', { prefix: commandPrefix }),
          getPhrase('commands.antilink.accepted_categories'),
        ]),
      );
      return;
    }

    if (result.status === 'invalid_action_mode') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.antilink.title'), [
          getPhrase('commands.antilink.accepted_actions'),
        ]),
      );
      return;
    }

    if (result.status === 'category_action_updated') {
      await client.sendMessage(
        chatId,
        success(getPhrase('commands.antilink.title'), getPhrase('commands.antilink.category_action_updated', {
          action: formatAction(result.normalizedMode),
        })),
      );
      return;
    }

    if (result.status === 'scope_reset') {
      await client.sendMessage(
        chatId,
        success(getPhrase('commands.antilink.title'), getPhrase('commands.antilink.scope_reset')),
      );
      return;
    }

    if (result.status === 'action_reset') {
      await client.sendMessage(
        chatId,
        success(getPhrase('commands.antilink.title'), getPhrase('commands.antilink.action_reset')),
      );
      return;
    }

    if (result.status === 'mode_updated') {
      await client.sendMessage(
        chatId,
        success(getPhrase('commands.antilink.title'), getPhrase('commands.antilink.mode_updated', {
          mode: result.targetMode,
        })),
      );
      return;
    }

    if (result.status === 'invalid_action') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.antilink.title'), [
          getPhrase('commands.antilink.usage_module_on', { prefix: commandPrefix }),
          getPhrase('commands.antilink.usage_module_off', { prefix: commandPrefix }),
          getPhrase('commands.antilink.usage_delete_anyone', { prefix: commandPrefix }),
          getPhrase('commands.antilink.usage_immune_admins', { prefix: commandPrefix }),
          getPhrase('commands.antilink.usage_action', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      success(
        getPhrase('commands.antilink.title'),
        getPhrase('commands.antilink.enabled_state', {
          state: result.enabled ? getPhrase('commands.statusgrupo.state_on') : getPhrase('commands.statusgrupo.state_off'),
        }),
      ),
    );
  },
};
