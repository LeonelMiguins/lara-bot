const { getPhrase } = require('../../services/messagePhraseService');
const { info } = require('../../utils/respond');

module.exports = {
  name: 'tagall',
  aliases: ['hidetag'],
  description: 'Menciona todos os membros do grupo.',
  menuExample: `#tagall`,
  help: {
    summary: 'Marca todos os participantes do grupo em uma unica mensagem.',
    examples: [
      '#tagall',
    ],
    notes: [
      'Use com cuidado para evitar spam e notificacoes excessivas.',
    ],
  },
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, participants }) {
    const mentions = participants
      .map((participant) => participant.id?._serialized)
      .filter(Boolean);

    const text = mentions.map((jid) => `@${jid.split('@')[0]}`).join('\n');

    await client.sendMessage(chatId, info(
      getPhrase('commands.tagall.title'),
      getPhrase('commands.tagall.body', { mentions: text }),
    ), {
      mentions,
    });
  },
};
