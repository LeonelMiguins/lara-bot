const config = require('../../config/config');
const {
  getAntiLinkSettings,
  normalizeAntiLinkAction,
  normalizeAntiLinkTargetMode,
  normalizeBlacklistCategory,
  resetAntiLinkAction,
  resetAntiLinkTargetMode,
  setGroupFeature,
  updateAntiLinkAction,
  updateAntiLinkTargetMode,
} = require('../../services/groupSettingsService');
const { error, info, invalidUsage, success } = require('../../utils/respond');

function formatStatus(groupSettings) {
  const enabled = Boolean(groupSettings?.features?.antiLink);
  return enabled ? '🟢 Ligado' : '🔴 Desligado';
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
    const action = String(args[0] || '').toLowerCase();
    const antiLinkSettings = getAntiLinkSettings(groupSettings);

    if (!action || action === 'list' || action === 'status') {
      await client.sendMessage(
        chatId,
        info(
          'Anti-link do grupo',
          [
            `Status atual: ${formatStatus(groupSettings)}`,
            `Escopo atual: ${formatTargetMode(antiLinkSettings.targetMode)}`,
            `WhatsApp: ${formatAction(antiLinkSettings.whatsappGroupLinks)}`,
            `Conteudo adulto: ${formatAction(antiLinkSettings.adultSites)}`,
            `Apostas: ${formatAction(antiLinkSettings.betsSites)}`,
            '',
            `Use *${commandPrefix}antilink on* para ligar.`,
            `Use *${commandPrefix}antilink off* para desligar.`,
            `Use *${commandPrefix}antilink all* para agir contra qualquer pessoa.`,
            `Use *${commandPrefix}antilink users* para manter admins e dono imunes.`,
            `Use *${commandPrefix}antilink acao <categoria> <apagar|banir>* para definir a acao.`,
          ].join('\n'),
        ),
      );
      return;
    }

    if (action === 'acao') {
      const category = normalizeBlacklistCategory(args[1]);
      const mode = String(args[2] || '').toLowerCase();

      if (!category) {
        await client.sendMessage(
          chatId,
          error('Anti-link do grupo', 'Categoria invalida. Use: whatsapp, adulto ou apostas.'),
        );
        return;
      }

      if (!mode) {
        await client.sendMessage(
          chatId,
          invalidUsage('Anti-link do grupo', [
            `Use *${commandPrefix}antilink acao <categoria> <apagar|banir>*.`,
            'Categorias aceitas: whatsapp, adulto, apostas.',
          ]),
        );
        return;
      }

      const normalizedMode = normalizeAntiLinkAction(mode);
      if (!normalizedMode) {
        await client.sendMessage(
          chatId,
          invalidUsage('Anti-link do grupo', [
            'Use apenas *apagar* ou *banir* para a acao.',
          ]),
        );
        return;
      }

      updateAntiLinkAction(chatId, category, normalizedMode);
      await client.sendMessage(
        chatId,
        success('Anti-link do grupo', `A categoria agora vai ${formatAction(normalizedMode)}.`),
      );
      return;
    }

    if (action === 'reset') {
      const category = normalizeBlacklistCategory(args[1]);
      if (!category && String(args[1] || '').toLowerCase() !== 'modo') {
        await client.sendMessage(
          chatId,
          error('Anti-link do grupo', 'Categoria invalida. Use: whatsapp, adulto ou apostas.'),
        );
        return;
      }

      if (String(args[1] || '').toLowerCase() === 'modo') {
        resetAntiLinkTargetMode(chatId);
        await client.sendMessage(
          chatId,
          success('Anti-link do grupo', 'O escopo do anti-link voltou para o padrao da base.'),
        );
        return;
      }

      resetAntiLinkAction(chatId, category);
      await client.sendMessage(
        chatId,
        success('Anti-link do grupo', 'A acao da categoria voltou para o padrao da base.'),
      );
      return;
    }

    const targetMode = normalizeAntiLinkTargetMode(action);
    if (targetMode) {
      updateAntiLinkTargetMode(chatId, targetMode);
      await client.sendMessage(
        chatId,
        success('Anti-link do grupo', `O anti-link agora esta em modo *${targetMode}*.`),
      );
      return;
    }

    if (action !== 'on' && action !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage('Anti-link do grupo', [
          `Use *${commandPrefix}antilink on* para ligar o modulo.`,
          `Use *${commandPrefix}antilink off* para desligar o modulo.`,
          `Use *${commandPrefix}antilink all* para apagar mensagem de qualquer um.`,
          `Use *${commandPrefix}antilink users* para manter admins e dono imunes.`,
          `Use *${commandPrefix}antilink acao <categoria> <apagar|banir>* para definir a acao.`,
        ]),
      );
      return;
    }

    const enabled = action === 'on';
    setGroupFeature(chatId, 'antiLink', enabled);

    await client.sendMessage(
      chatId,
      success(
        'Anti-link do grupo',
        `O anti-link agora está ${enabled ? 'ligado' : 'desligado'}.`,
      ),
    );
  },
};
