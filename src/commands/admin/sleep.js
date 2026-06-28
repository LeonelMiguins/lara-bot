const config = require('../../config/config');
const { getPhrase } = require('../../services/messagePhraseService');
const { invalidUsage, success } = require('../../utils/respond');

module.exports = {
  name: 'sleep',
  aliases: ['grupo'],
  description: 'Fecha ou abre o grupo para mensagens.',
  menuExample: `${config.prefix}sleep on|off`,
  help: {
    summary: 'Fecha o grupo para apenas administradores ou reabre para todos os membros.',
    examples: [
      '#sleep on',
      '#sleep off',
    ],
    notes: [
      'Quando ligado, somente administradores conseguem enviar mensagens no grupo.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, chat, args, commandPrefix }) {
    const mode = (args[0] || 'on').toLowerCase();

    if (mode !== 'on' && mode !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.sleep.title'), [
          getPhrase('commands.sleep.usage_on', { prefix: commandPrefix }),
          getPhrase('commands.sleep.usage_off', { prefix: commandPrefix }),
        ]),
      );
      return;
    }

    await chat.setMessagesAdminsOnly(mode === 'on');
    await client.sendMessage(
      chatId,
      success(
        getPhrase('commands.sleep.title'),
        mode === 'on'
          ? getPhrase('commands.sleep.enabled')
          : getPhrase('commands.sleep.disabled'),
      ),
    );
  },
};
