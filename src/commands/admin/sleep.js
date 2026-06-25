const config = require('../../config/config');
const { success, warning } = require('../../utils/respond');

module.exports = {
  name: 'sleep',
  aliases: ['grupo'],
  description: 'Fecha ou abre o grupo para mensagens.',
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, chat, args }) {
    const mode = (args[0] || 'on').toLowerCase();

    if (mode !== 'on' && mode !== 'off') {
      await client.sendMessage(
        chatId,
        warning('Modo silencioso', `Use *${config.prefix}sleep on* para fechar ou *${config.prefix}sleep off* para abrir o grupo.`),
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
