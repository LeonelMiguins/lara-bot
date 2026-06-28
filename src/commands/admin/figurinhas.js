const config = require('../../config/config');
const {
  buildStickerStatus,
  resolveStickerSettingsCommand,
} = require('../../services/commands/stickerCommandService');
const { getPhrase } = require('../../services/messagePhraseService');
const { commandPanel, createSection, denied, invalidUsage, phraseSuccess, success } = require('../../utils/respond');

function formatBooleanStatus(value) {
  return value ? getPhrase('commands.common.yes') : getPhrase('commands.common.no');
}

module.exports = {
  name: 'figurinhas',
  aliases: ['stickers', 'stickerconfig'],
  description: 'Configura o sistema de packs e figurinhas do grupo.',
  menuExamples: [
    `${config.prefix}figurinhas`,
    `${config.prefix}figurinhas auto on`,
    `${config.prefix}figurinhas tempo 30`,
  ],
  help: {
    summary: 'Controla envio automatico de packs, pedidos por membros e conteudo +18.',
    examples: [
      '#figurinhas',
      '#figurinhas auto on',
      '#figurinhas auto off',
      '#figurinhas tempo 30',
      '#figurinhas membros on',
      '#figurinhas adulto off',
    ],
    notes: [
      'O ajuste de tempo automatico fica restrito ao dono do bot.',
      'O dono pode usar esse comando no privado com --grupo.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings, senderIsOwner, commandPrefix }) {
    const result = resolveStickerSettingsCommand({
      chatId,
      args,
      groupSettings,
      senderIsOwner,
    });

    if (result.status === 'show_status') {
      const settings = buildStickerStatus(groupSettings);
      await client.sendMessage(
        chatId,
        commandPanel(getPhrase('commands.figurinhas.title'), {
          sections: [
            createSection(getPhrase('labels.status'), [
              getPhrase('commands.figurinhas.status_auto', {
                value: result.autoEnabled ? getPhrase('commands.common.status_on') : getPhrase('commands.common.status_off'),
              }),
              getPhrase('commands.figurinhas.status_interval', {
                value: settings.autoSendIntervalMinutes,
              }),
              getPhrase('commands.figurinhas.status_members', {
                value: formatBooleanStatus(settings.allowMemberPackRequests),
              }),
              getPhrase('commands.figurinhas.status_adult', {
                value: formatBooleanStatus(settings.allowAdult),
              }),
            ]),
          ],
          footer: [
            getPhrase('commands.figurinhas.usage_auto_on', { prefix: commandPrefix }),
            getPhrase('commands.figurinhas.usage_auto_off', { prefix: commandPrefix }),
            getPhrase('commands.figurinhas.usage_time', { prefix: commandPrefix }),
            getPhrase('commands.figurinhas.usage_members_on', { prefix: commandPrefix }),
            getPhrase('commands.figurinhas.usage_members_off', { prefix: commandPrefix }),
            getPhrase('commands.figurinhas.usage_adult_on', { prefix: commandPrefix }),
            getPhrase('commands.figurinhas.usage_adult_off', { prefix: commandPrefix }),
          ],
        }),
      );
      return;
    }

    if (result.status === 'tempo_owner_only') {
      await client.sendMessage(
        chatId,
        denied(getPhrase('commands.figurinhas.title'), getPhrase('commands.figurinhas.owner_time_only'), [
          getPhrase('commands.figurinhas.owner_time_action'),
        ]),
      );
      return;
    }

    if (result.status === 'invalid_minutes') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.figurinhas.title'), [
          getPhrase('commands.figurinhas.usage_time', { prefix: commandPrefix }),
        ], getPhrase('commands.figurinhas.invalid_minutes')),
      );
      return;
    }

    if (result.status === 'invalid_auto' || result.status === 'invalid_members' || result.status === 'invalid_adult' || result.status === 'invalid_scope') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.figurinhas.title'), [
          getPhrase('commands.figurinhas.usage_auto_on', { prefix: commandPrefix }),
          getPhrase('commands.figurinhas.usage_auto_off', { prefix: commandPrefix }),
          getPhrase('commands.figurinhas.usage_time', { prefix: commandPrefix }),
          getPhrase('commands.figurinhas.usage_members_on', { prefix: commandPrefix }),
          getPhrase('commands.figurinhas.usage_members_off', { prefix: commandPrefix }),
          getPhrase('commands.figurinhas.usage_adult_on', { prefix: commandPrefix }),
          getPhrase('commands.figurinhas.usage_adult_off', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    if (result.status === 'auto_updated') {
      await client.sendMessage(
        chatId,
        phraseSuccess(result.enabled ? 'success.module_enabled' : 'success.module_disabled', {
          module_name: getPhrase('modules.feature_sticker_auto'),
        }),
      );
      return;
    }

    if (result.status === 'interval_updated') {
      await client.sendMessage(
        chatId,
        success(getPhrase('commands.figurinhas.title'), getPhrase('commands.figurinhas.interval_updated', {
          value: result.minutes,
        })),
      );
      return;
    }

    if (result.status === 'members_updated') {
      await client.sendMessage(
        chatId,
        success(
          getPhrase('commands.figurinhas.title'),
          getPhrase(result.enabled ? 'commands.figurinhas.members_enabled' : 'commands.figurinhas.members_disabled'),
        ),
      );
      return;
    }

    await client.sendMessage(
      chatId,
      success(
        getPhrase('commands.figurinhas.title'),
        getPhrase(result.enabled ? 'commands.figurinhas.adult_enabled' : 'commands.figurinhas.adult_disabled'),
      ),
    );
  },
};
