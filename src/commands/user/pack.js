const config = require('../../config/config');
const {
  resolvePackRequest,
} = require('../../services/commands/stickerCommandService');
const { getPhrase } = require('../../services/messagePhraseService');
const { sendPackToChat } = require('../../services/stickerPackService');
const { commandPanel, createSection, denied, error, info, invalidUsage } = require('../../utils/respond');

module.exports = {
  name: 'pack',
  aliases: ['packs', 'figurinha', 'stickerpack'],
  description: 'Envia um pack aleatorio de figurinhas.',
  menuExamples: [
    `${config.prefix}pack`,
    `${config.prefix}pack memes`,
    `${config.prefix}pack categorias`,
  ],
  help: {
    summary: 'Envia um pack aleatorio de figurinhas, geral ou por categoria.',
    examples: [
      '#pack',
      '#pack memes',
      '#pack anime',
      '#pack categorias',
    ],
    notes: [
      'Administradores e dono sempre podem usar.',
      'Membros comuns dependem da liberacao configurada em #figurinhas membros on|off.',
    ],
  },
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId, args, groupSettings, senderIsAdmin, senderIsOwner, commandPrefix }) {
    const category = args.join(' ').trim();
    const result = await resolvePackRequest({
      category,
      groupSettings,
      senderIsAdmin,
      senderIsOwner,
    });

    if (result.status === 'members_blocked') {
      await client.sendMessage(
        chatId,
        denied(getPhrase('commands.pack.title'), getPhrase('commands.pack.members_blocked'), [
          getPhrase('commands.pack.members_blocked_action'),
        ]),
      );
      return;
    }

    if (result.status === 'show_categories') {
      if (!result.categories.length) {
        await client.sendMessage(chatId, error(getPhrase('commands.pack.categories_title'), getPhrase('commands.pack.categories_empty')));
        return;
      }

      await client.sendMessage(
        chatId,
        commandPanel(getPhrase('commands.pack.categories_title'), {
          sections: [
            createSection(getPhrase('labels.summary'), result.categories.map((item) => `⤷ \`${item}\``)),
          ],
          footer: [
            getPhrase('commands.pack.categories_usage', { prefix: commandPrefix }),
          ],
        }),
      );
      return;
    }

    if (result.status === 'invalid_category') {
      await client.sendMessage(
        chatId,
        invalidUsage(getPhrase('commands.pack.title'), [
          getPhrase('commands.pack.usage_random', { prefix: commandPrefix }),
          getPhrase('commands.pack.usage_category', { prefix: commandPrefix }),
          getPhrase('commands.pack.usage_categories', { prefix: commandPrefix }),
        ], getPhrase('commands.pack.invalid_category')),
      );
      return;
    }

    if (result.status === 'no_pack') {
      await client.sendMessage(chatId, error(getPhrase('commands.pack.title'), getPhrase('commands.pack.no_pack')));
      return;
    }

    await client.sendMessage(
      chatId,
      info(getPhrase('commands.pack.title'), [
        category
          ? getPhrase('commands.pack.sending_category', { category: result.category })
          : getPhrase('commands.pack.sending_random'),
        getPhrase('commands.pack.pack_header', { pack_name: result.pack.name }),
        getPhrase('commands.pack.pack_meta', {
          category: result.pack.category,
          count: result.pack.stickers.length,
        }),
      ].join('\n')),
    );

    await sendPackToChat(client, chatId, result.pack, {
      delayMs: groupSettings?.stickers?.sendDelayMs,
    });
  },
};
