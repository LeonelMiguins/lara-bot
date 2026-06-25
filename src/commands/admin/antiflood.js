const config = require('../../config/config');
const {
  getAntiFloodSettings,
  resetAntiFloodSettings,
  setGroupFeature,
  updateAntiFloodSettings,
} = require('../../services/groupSettingsService');
const { info, success, warning } = require('../../utils/respond');

function formatAntiFlood(groupSettings) {
  const settings = getAntiFloodSettings(groupSettings);
  const enabled = Boolean(groupSettings?.features?.antiFlood);

  return [
    `Status: ${enabled ? '🟢 Ligado' : '🔴 Desligado'}`,
    `Limite de repeticoes: ${settings.repeatedMessagesThreshold}`,
    `Janela: ${Math.round(settings.windowMs / 1000)}s`,
    `Tamanho minimo da mensagem: ${settings.minMessageLength}`,
  ].join('\n');
}

module.exports = {
  name: 'antiflood',
  aliases: ['flood'],
  description: 'Mostra e edita os limites do anti-flood.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, args, groupSettings }) {
    if (!args.length || String(args[0]).toLowerCase() === 'list') {
      await client.sendMessage(
        chatId,
        info(
          'Anti-flood do grupo',
          [
            formatAntiFlood(groupSettings),
            '',
            `Use *${config.prefix}antiflood on* para ligar.`,
            `Use *${config.prefix}antiflood off* para desligar.`,
            `Use *${config.prefix}antiflood limite <numero>* para alterar o limite.`,
            `Use *${config.prefix}antiflood janela <segundos>* para alterar a janela.`,
            `Use *${config.prefix}antiflood minimo <numero>* para alterar o tamanho minimo.`,
            `Use *${config.prefix}antiflood reset* para restaurar o padrao.`,
          ].join('\n'),
        ),
      );
      return;
    }

    const action = String(args[0] || '').toLowerCase();

    if (action === 'on' || action === 'off') {
      const enabled = action === 'on';
      setGroupFeature(chatId, 'antiFlood', enabled);
      await client.sendMessage(
        chatId,
        success(
          'Anti-flood do grupo',
          `O anti-flood agora está ${enabled ? 'ligado' : 'desligado'}.`,
        ),
      );
      return;
    }

    if (action === 'reset') {
      resetAntiFloodSettings(chatId);
      await client.sendMessage(chatId, success('Anti-flood do grupo', 'Configuracao restaurada para o padrao da base.'));
      return;
    }

    const value = Number(args[1]);
    if (!Number.isFinite(value)) {
      await client.sendMessage(
        chatId,
        warning('Anti-flood do grupo', 'Informe um valor numerico valido.'),
      );
      return;
    }

    if (action === 'limite') {
      if (value < 2) {
        await client.sendMessage(chatId, warning('Anti-flood do grupo', 'O limite minimo recomendado e 2.'));
        return;
      }

      updateAntiFloodSettings(chatId, { repeatedMessagesThreshold: Math.floor(value) });
      await client.sendMessage(chatId, success('Anti-flood do grupo', 'Limite de repeticoes atualizado com sucesso.'));
      return;
    }

    if (action === 'janela') {
      if (value < 3) {
        await client.sendMessage(chatId, warning('Anti-flood do grupo', 'A janela minima recomendada e 3 segundos.'));
        return;
      }

      updateAntiFloodSettings(chatId, { windowMs: Math.floor(value * 1000) });
      await client.sendMessage(chatId, success('Anti-flood do grupo', 'Janela do anti-flood atualizada com sucesso.'));
      return;
    }

    if (action === 'minimo' || action === 'min') {
      if (value < 1) {
        await client.sendMessage(chatId, warning('Anti-flood do grupo', 'O tamanho minimo precisa ser pelo menos 1.'));
        return;
      }

      updateAntiFloodSettings(chatId, { minMessageLength: Math.floor(value) });
      await client.sendMessage(chatId, success('Anti-flood do grupo', 'Tamanho minimo atualizado com sucesso.'));
      return;
    }

    await client.sendMessage(
      chatId,
      warning(
        'Anti-flood do grupo',
        [
          `Use *${config.prefix}antiflood* para ver a configuracao.`,
          `Use *${config.prefix}antiflood on* para ligar.`,
          `Use *${config.prefix}antiflood off* para desligar.`,
          `Use *${config.prefix}antiflood limite <numero>* para alterar o limite.`,
          `Use *${config.prefix}antiflood janela <segundos>* para alterar a janela.`,
          `Use *${config.prefix}antiflood minimo <numero>* para alterar o minimo.`,
          `Use *${config.prefix}antiflood reset* para restaurar o padrao.`,
        ].join('\n'),
      ),
    );
  },
};
