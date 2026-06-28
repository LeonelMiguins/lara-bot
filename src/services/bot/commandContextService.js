const { loadGroupSettings } = require('../groupSettingsService');
const ownerNotifications = require('../ownerNotificationService');
const { getEffectivePrefix } = require('../prefixService');
const {
  findParticipantById,
  isAdminParticipant,
  resolveUserAliases,
} = require('../whatsappIdentityService');
const {
  getChatMetadata,
  getMentionedIds,
  getQuotedMessage,
  getSenderId,
  normalizeChatId,
  normalizeUserId,
} = require('../../utils/wweb');

async function buildMessageContext(message) {
  const senderId = normalizeUserId(await getSenderId(message));
  const senderIsOwner = await ownerNotifications.isOwnerUser(message.client, senderId);
  const { chat } = await getChatMetadata(message);
  const mentions = await getMentionedIds(message);
  const quotedMessage = await getQuotedMessage(message);

  return buildChatExecutionContext(message.client, chat, senderId, {
    senderIsOwner,
    mentions,
    quotedMessage,
  });
}

async function buildChatExecutionContext(client, chat, senderId, extra = {}) {
  const chatId = chat.id._serialized;
  const contact = await chat.getContact();
  const chatName = chat.name || contact.pushname || contact.name || 'chat';
  const isGroup = chat.isGroup;
  const me = await client.getContactById(client.info.wid._serialized);
  const meId = normalizeUserId(me.id._serialized);
  const senderIsOwner = Boolean(extra.senderIsOwner);

  let senderIsAdmin = false;
  let botIsAdmin = false;
  let participants = [];
  let groupSettings = null;

  if (isGroup) {
    participants = chat.participants || [];
    groupSettings = loadGroupSettings(chatId);
    const [senderAliases, meAliases] = await Promise.all([
      resolveUserAliases(client, senderId),
      resolveUserAliases(client, meId),
    ]);

    senderIsAdmin = Array.from(senderAliases).some((alias) =>
      isAdminParticipant(findParticipantById(participants, alias)),
    );
    botIsAdmin = Array.from(meAliases).some((alias) =>
      isAdminParticipant(findParticipantById(participants, alias)),
    );
  }

  const commandPrefix = getEffectivePrefix({ isGroup, groupSettings });

  return {
    chat,
    chatId,
    chatName,
    isGroup,
    senderId,
    senderIsOwner,
    senderIsAdmin,
    botIsAdmin,
    participants,
    groupConfig: groupSettings,
    groupSettings,
    commandPrefix,
    mentions: extra.mentions || [],
    quotedMessage: extra.quotedMessage || null,
    ownerIsOperator: Boolean(extra.ownerIsOperator),
  };
}

function parseTargetGroupArgs(args) {
  const nextArgs = [...args];
  const flagIndex = nextArgs.findIndex((arg) => ['--grupo', '--group', '-g'].includes(String(arg).toLowerCase()));

  if (flagIndex === -1) {
    return { targetGroupId: '', args: nextArgs };
  }

  const rawGroupId = normalizeChatId(nextArgs[flagIndex + 1] || '');
  const targetGroupId = rawGroupId.endsWith('@g.us') ? rawGroupId : `${rawGroupId.replace(/@.+$/i, '')}@g.us`;
  nextArgs.splice(flagIndex, 2);

  return {
    targetGroupId,
    args: nextArgs,
  };
}

async function resolveExecutionContext(client, message, command, args, baseContext) {
  if (baseContext.isGroup) {
    return {
      context: baseContext,
      args,
      body: String(message.body || '').trim(),
    };
  }

  if (!baseContext.senderIsOwner) {
    return {
      error: 'Somente o dono do bot pode executar comandos de grupo no privado.',
    };
  }

  if (!command.groupOnly) {
    return {
      context: {
        ...baseContext,
        ownerIsOperator: true,
      },
      args,
      body: String(message.body || '').trim(),
    };
  }

  const parsed = parseTargetGroupArgs(args);
  if (!parsed.targetGroupId) {
    return {
      error: `Use *${baseContext.commandPrefix}grupos* para listar os grupos e *--grupo <ID_DO_GRUPO>* para escolher o alvo.`,
    };
  }

  let targetChat;
  try {
    targetChat = await client.getChatById(parsed.targetGroupId);
  } catch {
    return {
      error: 'Nao consegui encontrar esse grupo alvo.',
    };
  }

  if (!targetChat?.isGroup) {
    return {
      error: 'O ID informado nao pertence a um grupo.',
    };
  }

  const context = await buildChatExecutionContext(client, targetChat, baseContext.senderId, {
    senderIsOwner: true,
    mentions: [],
    quotedMessage: null,
    ownerIsOperator: true,
  });

  return {
    context,
    args: parsed.args,
    body: `${context.commandPrefix}${command.name}${parsed.args.length ? ` ${parsed.args.join(' ')}` : ''}`,
  };
}

module.exports = {
  buildChatExecutionContext,
  buildMessageContext,
  resolveExecutionContext,
};
