const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config/config');
const { loadCommands } = require('./core/commandLoader');
const setupAntiFlood = require('./modules/antiFlood');
const setupAntiLink = require('./modules/antiLink');
const setupFarewell = require('./modules/farewell');
const setupWelcome = require('./modules/welcome');
const { loadGroupSettings } = require('./services/groupSettingsService');
const logger = require('./services/loggerService');
const { setCommandCatalog } = require('./services/menuService');
const ownerNotifications = require('./services/ownerNotificationService');
const { getEffectivePrefix } = require('./services/prefixService');
const {
  findParticipantById,
  isAdminParticipant,
  resolveUserAliases,
} = require('./services/whatsappIdentityService');
const {
  denied,
  failure: failureMessage,
  unavailable,
} = require('./utils/respond');
const { digitsOnly } = require('./utils/text');
const {
  ensureDirectory,
  getParticipantId,
  getChatMetadata,
  getMentionedIds,
  getQuotedMessage,
  getSenderId,
  normalizeChatId,
  normalizeUserId,
} = require('./utils/wweb');

const runtimeState = {
  reconnectAttempts: 0,
  stopReconnect: false,
  announcedWaitingForQr: false,
  pairingCodeRequested: false,
};

function formatPhoneDisplay(value) {
  const digits = digitsOnly(value);
  return digits ? `+${digits}` : 'nao configurado';
}

function formatCommandList(commands) {
  const names = (commands?.catalog || [])
    .map((command) => command.name)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, 'pt-BR'));

  return names.length ? names.join(', ') : 'nenhum';
}

function createClient() {
  ensureDirectory(config.paths.authDir);
  ensureDirectory(config.paths.webCacheDir);

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: config.paths.authDir,
      clientId: 'lara-bot',
    }),
    qrMaxRetries: config.connection.qrMaxRetries,
    takeoverOnConflict: config.connection.takeoverOnConflict,
    takeoverTimeoutMs: config.connection.takeoverTimeoutMs,
    authTimeoutMs: 60000,
    puppeteer: {
      headless: config.puppeteer.headless,
      executablePath: config.puppeteer.executablePath,
      args: config.puppeteer.args,
    },
    webVersionCache: {
      type: 'local',
      path: path.join(config.paths.webCacheDir, 'web-version-cache'),
      strict: false,
    },
    pairWithPhoneNumber:
      config.pairing.mode === 'phone' && config.pairing.experimentalPhoneNumber
        ? {
            phoneNumber: digitsOnly(config.pairing.experimentalPhoneNumber),
            showNotification: config.pairing.showNotification,
            intervalMs: config.pairing.intervalMs,
          }
        : undefined,
  });

  return client;
}

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

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function startBot() {
  if (runtimeState.stopReconnect) {
    return;
  }

  const commands = loadCommands(path.join(__dirname, 'commands'));
  setCommandCatalog(commands.catalog || []);
  logger.connectionPanel('Inicializacao do bot', [
    `Bot: ${config.botName} v${config.version}`,
    `Dono configurado: ${formatPhoneDisplay(config.owner?.phone)}`,
    `Prefixo padrao: ${config.prefix}`,
    `Comandos carregados: ${(commands.catalog || []).length}`,
    `Lista: ${formatCommandList(commands)}`,
  ]);
  const client = createClient();
  const handleAntiFlood = setupAntiFlood(client);
  const handleAntiLink = setupAntiLink(client);
  setupFarewell(client);
  setupWelcome(client);

  client.on('loading_screen', () => {
    if (!runtimeState.announcedWaitingForQr) {
      runtimeState.announcedWaitingForQr = true;
      logger.connectionPanel('Carregando sessao', [
        'Iniciando a conexao com o WhatsApp Web.',
        'Aguarde os proximos eventos de autenticacao.',
      ]);
    }
  });

  client.on('qr', (qr) => {
    runtimeState.announcedWaitingForQr = false;
    runtimeState.pairingCodeRequested = false;
    logger.connectionPanel('QR Code disponivel', [
      `Bot: ${config.botName} v${config.version}`,
      `Dono configurado: ${formatPhoneDisplay(config.owner?.phone)}`,
      'Escaneie o QR Code abaixo com o WhatsApp que vai operar o bot.',
    ]);
    qrcode.generate(qr, { small: true });
  });

  client.on('code', (code) => {
    runtimeState.pairingCodeRequested = true;
    logger.connectionEvent('client.pairing_code.generated', { code });
  });

  client.on('authenticated', () => {
    runtimeState.reconnectAttempts = 0;
    logger.connectionPanel('Sessao autenticada', [
      'Autenticacao aceita pelo WhatsApp.',
      'Finalizando a sincronizacao da sessao...',
    ]);
  });

  client.on('ready', () => {
    runtimeState.reconnectAttempts = 0;
    runtimeState.announcedWaitingForQr = false;
    logger.connectionPanel('Bot conectado com sucesso', [
      `Bot: ${config.botName} v${config.version}`,
      `Numero do bot: ${formatPhoneDisplay(client.info?.wid?.user)}`,
      `Dono configurado: ${formatPhoneDisplay(config.owner?.phone)}`,
      `Comandos carregados: ${(commands.catalog || []).length}`,
      'Sessao pronta para receber comandos.',
    ]);
  });

  client.on('auth_failure', (message) => {
    logger.connectionPanel('Falha de autenticacao', [
      'O WhatsApp recusou a sessao atual.',
      `Detalhe: ${message || 'motivo nao informado'}`,
    ], {
      level: 'warn',
    });
  });

  client.on('disconnected', async (reason) => {
    const maxReconnectAttempts = config.connection.maxReconnectAttempts ?? 6;
    const reconnectDelayMs = config.connection.reconnectDelayMs ?? 3000;

    logger.connectionPanel('Conexao encerrada', [
      `Motivo: ${reason || 'nao informado'}`,
      `Tentativa de reconexao: ${runtimeState.reconnectAttempts + 1}/${maxReconnectAttempts}`,
    ], {
      level: 'warn',
    });

    runtimeState.reconnectAttempts += 1;
    if (runtimeState.reconnectAttempts >= maxReconnectAttempts) {
      runtimeState.stopReconnect = true;
      logger.connectionPanel('Limite de reconexao atingido', [
        `Total de tentativas: ${maxReconnectAttempts}`,
        'Verifique a sessao, a internet ou refaca a autenticacao.',
      ], {
        level: 'warn',
      });
      return;
    }

    try {
      await client.destroy();
    } catch {}

    await sleep(reconnectDelayMs);
    startBot();
  });

  client.on('message', async (message) => {
    let activeContext = {};
    let activeCommandName = 'unknown';

    try {
      const context = await buildMessageContext(message);
      activeContext = context;

      if (!context.chatId || context.chatId === 'status@broadcast') {
        return;
      }

      const flooded = await handleAntiFlood(message, context);
      if (flooded) {
        return;
      }

      const blocked = await handleAntiLink(message, context);
      if (blocked) {
        return;
      }

      const body = String(message.body || '').trim();
      const activePrefix = context.commandPrefix || config.prefix;

      if (!body.startsWith(activePrefix)) {
        return;
      }

      const parts = body.slice(activePrefix.length).trim().split(/\s+/).filter(Boolean);
      if (!parts.length) {
        return;
      }

      const commandName = parts.shift().toLowerCase();
      activeCommandName = commandName;
      const command = commands.get(commandName);
      if (!command) {
        return;
      }

      const execution = await resolveExecutionContext(client, message, command, parts, context);
      if (execution.error) {
        logger.commandRejected(command.name, 'target_context_missing', context);
        await client.sendMessage(
          context.chatId,
          unavailable('Comando indisponivel', execution.error, [
            `Use *${context.commandPrefix}menu* para ver os comandos disponiveis.`,
          ]),
        );
        return;
      }

      const executionContext = execution.context;
      const executionArgs = execution.args;
      const executionBody = execution.body;
      activeContext = executionContext;

      logger.commandReceived(command.name, executionArgs, executionContext);

      if (command.ownerOnly && !executionContext.senderIsOwner) {
        logger.commandRejected(command.name, 'owner_only', executionContext);
        await client.sendMessage(
          context.chatId,
          denied('Permissao negada', 'Apenas o dono do bot pode usar esse comando.', [
            'Use esse comando no numero principal configurado como dono.',
          ]),
        );
        return;
      }

      if (command.groupOnly && !executionContext.isGroup) {
        logger.commandRejected(command.name, 'group_only', executionContext);
        await client.sendMessage(
          context.chatId,
          unavailable('Comando indisponivel', 'Esse comando so pode ser usado em grupos.', [
            'Envie esse comando dentro de um grupo.',
            `Se voce for o dono, use *${context.commandPrefix}grupos* e *--grupo <ID_DO_GRUPO>* no privado.`,
          ]),
        );
        return;
      }

      if (command.adminOnly && !executionContext.senderIsAdmin && !executionContext.ownerIsOperator) {
        logger.commandRejected(command.name, 'admin_only', executionContext, {
          participants: executionContext.participants
            .map((participant) => `${getParticipantId(participant)}:${isAdminParticipant(participant) ? 'admin' : 'membro'}`),
        });
        await client.sendMessage(
          context.chatId,
          denied('Permissao negada', 'Apenas administradores podem usar esse comando.', [
            'Confirme se o seu numero aparece como administrador no grupo.',
            'Se voce for o dono do bot, tambem pode usar o comando no privado com --grupo <ID_DO_GRUPO>.',
          ]),
        );
        return;
      }

      const startedAt = Date.now();
      await command.execute({
        client,
        message,
        args: executionArgs,
        body: executionBody,
        ...executionContext,
      });
      logger.commandCompleted(command.name, Date.now() - startedAt, executionContext);
      await ownerNotifications.notifyCommandExecuted(client, command.name, executionContext, Date.now() - startedAt);
    } catch (runtimeError) {
      logger.commandFailed(activeCommandName, runtimeError, activeContext);
      try {
        await message.reply(
          failureMessage('Falha no comando', 'Ocorreu um erro ao executar esse comando.', [
            'Tente novamente em alguns instantes.',
            `Se o problema continuar, confira *${activeContext.commandPrefix || config.prefix}logs* no privado do dono.`,
          ]),
        );
      } catch {}
    }
  });

  await client.initialize();
}

startBot().catch((error) => {
  logger.connectionPanel('Falha fatal ao iniciar', [
    `Erro: ${error?.message || String(error)}`,
    'O processo foi interrompido antes da conexao completar.',
  ], {
    level: 'error',
  });
  process.exitCode = 1;
});
