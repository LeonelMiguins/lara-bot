const { info } = require('../../utils/respond');

module.exports = {
  name: 'tagall',
  aliases: ['hidetag'],
  description: 'Menciona todos os membros do grupo.',
  menuExample: `#tagall`,
  groupOnly: true,
  adminOnly: true,
  async execute({ client, chatId, participants }) {
    const mentions = participants
      .map((participant) => participant.id?._serialized)
      .filter(Boolean);

    const text = mentions.map((jid) => `@${jid.split('@')[0]}`).join('\n');

    await client.sendMessage(chatId, info('Marcar membros', `Chamando todo mundo:\n\n${text}`), {
      mentions,
    });
  },
};
