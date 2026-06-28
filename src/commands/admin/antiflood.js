const config = require('../../config/config');
const { resolveAntiFloodCommand } = require('../../services/commands/groupProtectionCommandService');
const { getPhrase } = require('../../services/messagePhraseService');
const { getAntiFloodSettings } = require('../../services/groupSettingsService');
const { info, invalidUsage, success, warning } = require('../../utils/respond');

function formatAntiFlood(groupSettings) {
  const settings = getAntiFloodSettings(groupSettings);
  const enabled = Boolean(groupSettings?.features?.antiFlood);

  return [
    getPhrase('commands.antiflood.status_line', {
      status: enabled ? getPhrase('commands.common.status_on') : getPhrase('commands.common.status_off'),
    }),
    getPhrase('commands.antiflood.limit_line', { value: settings.repeatedMessagesThreshold }),
    getPhrase('commands.antiflood.window_line', { value: Math.round(settings.windowMs / 1000) }),
    getPhrase('commands.antiflood.min_line', { value: settings.minMessageLength }),
  ].join('\n');
}

module.exports = {
  name: 'antiflood',
  aliases: ['flood'],
  description: 'Mostra e edita os limites do anti-flood.',
  menuExamples: [
    `${config.prefix}antiflood on|off`,
    `${config.prefix}antiflood limite 8`,
  ],
  help: {
    summary: 'Mostra e ajusta a protecao contra flood por repeticao de mensagens.',
    examples: [
      '#antiflood',
      '#antiflood on',
      '#antiflood off',
      '#antiflood limite 8',
      '#antiflood janela 15',
      '#antiflood minimo 2',
      '#antiflood reset',
    ],
    notes: [
      'O limite controla quantas mensagens repetidas disparam a protecao.',
      'A janela e definida em segundos.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings, commandPrefix }) {
    const result = resolveAntiFloodCommand({ chatId, args, groupSettings });

    if (result.status === 'show_status') {
      await client.sendMessage(
        chatId,
        info(
          getPhrase('commands.antiflood.title'),
          [
            formatAntiFlood(groupSettings),
            '',
            getPhrase('commands.antiflood.usage_on', { prefix: commandPrefix }),
            getPhrase('commands.antiflood.usage_off', { prefix: commandPrefix }),
            getPhrase('commands.antiflood.usage_limit', { prefix: commandPrefix }),
            getPhrase('commands.antiflood.usage_window', { prefix: commandPrefix }),
            getPhrase('commands.antiflood.usage_min', { prefix: commandPrefix }),
            getPhrase('commands.antiflood.usage_reset', { prefix: commandPrefix }),
          ].join('\n'),
        ),
      );
      return;
    }

    if (result.status === 'updated_state') {
      await client.sendMessage(
        chatId,
        success(
          getPhrase('commands.antiflood.title'),
          getPhrase('commands.antiflood.enabled_state', {
            state: result.enabled ? getPhrase('commands.statusgrupo.state_on') : getPhrase('commands.statusgrupo.state_off'),
          }),
        ),
      );
      return;
    }

    if (result.status === 'reset') {
      await client.sendMessage(chatId, success(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.reset_done')));
      return;
    }

    if (result.status === 'invalid_number') {
      await client.sendMessage(
        chatId,
        invalidUsage(
          getPhrase('commands.antiflood.title'),
          [
            getPhrase('commands.antiflood.invalid_number_action', {
              prefix: commandPrefix,
              action: result.action,
            }),
          ],
          getPhrase('commands.antiflood.invalid_number'),
        ),
      );
      return;
    }

    if (result.status === 'limit_too_low') {
      await client.sendMessage(chatId, warning(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.limit_min_warning')));
      return;
    }

    if (result.status === 'limit_updated') {
      await client.sendMessage(chatId, success(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.limit_updated')));
      return;
    }

    if (result.status === 'window_too_low') {
      await client.sendMessage(chatId, warning(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.window_min_warning')));
      return;
    }

    if (result.status === 'window_updated') {
      await client.sendMessage(chatId, success(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.window_updated')));
      return;
    }

    if (result.status === 'min_too_low') {
      await client.sendMessage(chatId, warning(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.message_min_warning')));
      return;
    }

    if (result.status === 'min_updated') {
      await client.sendMessage(chatId, success(getPhrase('commands.antiflood.title'), getPhrase('commands.antiflood.min_updated')));
      return;
    }

    await client.sendMessage(
      chatId,
      invalidUsage(getPhrase('commands.antiflood.title'), [
        getPhrase('commands.antiflood.usage_status', { prefix: commandPrefix }),
        getPhrase('commands.antiflood.usage_on', { prefix: commandPrefix }),
        getPhrase('commands.antiflood.usage_off', { prefix: commandPrefix }),
        getPhrase('commands.antiflood.usage_limit', { prefix: commandPrefix }),
        getPhrase('commands.antiflood.usage_window', { prefix: commandPrefix }),
        getPhrase('commands.antiflood.usage_min', { prefix: commandPrefix }),
        getPhrase('commands.antiflood.usage_reset', { prefix: commandPrefix }),
      ]),
    );
  },
};
