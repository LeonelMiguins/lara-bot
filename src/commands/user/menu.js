const config = require('../../config/config');
const { info } = require('../../utils/respond');

module.exports = {
  name: 'menu',
  aliases: ['help'],
  description: 'Mostra o menu principal.',
  groupOnly: false,
  adminOnly: false,
  async execute({ client, chatId }) {
    const p = config.prefix;
    const text = [
      `*${config.botName}*`,
      '',
      '*Administracao*',
      `${p}ban @membro`,
      `${p}adm @membro`,
      `${p}sleep on|off`,
      `${p}tagall`,
      `${p}bot`,
      `${p}bot server`,
      `${p}modulos`,
      '',
      '*Automaticos*',
      '🟢/🔴 Controle por #modulos',
      'Boas-vindas automáticas',
      'Anti-link para grupos, apostas e conteúdo adulto',
      'Anti-flood para repetição',
      '',
      '*Usuarios*',
      `${p}menu`,
      `${p}regras`,
      `${p}groupinfo`,
      `${p}link`,
      `${p}adms`,
      `${p}figu`,
    ].join('\n');

    await client.sendMessage(chatId, info('Menu principal', text));
  },
};
