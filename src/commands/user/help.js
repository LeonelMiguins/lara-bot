const { sendCommandHelp } = require('../../services/commandHelpService');
const { phraseWarning } = require('../../utils/respond');

module.exports = {
  name: 'help',
  aliases: ['ajuda'],
  description: 'Mostra a ajuda detalhada de um comando.',
  menuExample: '#help <comando>',
  help: {
    summary: 'Mostra a ajuda detalhada de qualquer comando carregado pelo bot.',
    examples: [
      '#help menu',
      '#help antilink',
      '#ban help',
      '#prefixo grupo help',
    ],
    notes: [
      'Tambem funciona quando voce adiciona help ou ajuda no final de outro comando.',
      'Aceita nome principal e aliases do comando.',
    ],
  },
  groupOnly: false,
  adminOnly: false,
  async execute({ client, chatId, args, commandRegistry, commandPrefix }) {
    const targetName = String(args[0] || '').toLowerCase();

    if (!targetName) {
      await client.sendMessage(chatId, phraseWarning('common.command_invalid'));
      return;
    }

    const targetCommand = commandRegistry?.get(targetName);
    if (!targetCommand) {
      await client.sendMessage(chatId, phraseWarning('common.command_unavailable'));
      return;
    }

    await sendCommandHelp({
      client,
      chatId,
      command: targetCommand,
      commandPrefix,
    });
  },
};
