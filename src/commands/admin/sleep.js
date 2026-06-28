const config = require('../../config/config');
const { invalidUsage, success } = require('../../utils/respond');

module.exports = {
  name: 'sleep',
  aliases: ['grupo'],
  description: 'Fecha ou abre o grupo para mensagens.',
  menuExample: `${config.prefix}sleep on|off`,
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, chat, args, commandPrefix }) {
    const mode = (args[0] || 'on').toLowerCase();

    if (mode !== 'on' && mode !== 'off') {
      await client.sendMessage(
        chatId,
        invalidUsage('Modo silencioso', [
          `Use *${commandPrefix}sleep on* para fechar o grupo.`,
          `Use *${commandPrefix}sleep off* para reabrir o grupo.`,
        ]),
      );
      return;
    }

    await chat.setMessagesAdminsOnly(mode === 'on');
    await client.sendMessage(
      chatId,
      success(
        'Modo silencioso',
        mode === 'on'
          ? 'Modo silencioso ativado. Agora so administradores podem enviar mensagens.'
          : 'Grupo reaberto. Todos os membros podem enviar mensagens novamente.',
      ),
    );
  },
};
