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
const {
  buildMessageContext,
  resolveExecutionContext,
} = require('./services/bot/commandContextService');
const { executeCommand, maybeSendCommandHelp } = require('./services/bot/commandExecutionService');
const { parseCommandMessage } = require('./services/bot/commandParserService');
const { finalizeCommandExecution, handleCommandFailure } = require('./services/bot/commandPostExecutionService');
const { validateCommandPermission } = require('./services/bot/commandPermissionService');
const logger = require('./services/loggerService');
const { setCommandCatalog } = require('./services/menuService');
const {
  phraseError,
  phraseWarning,
} = require('./utils/respond');
const { digitsOnly } = require('./utils/text');
const {
  ensureDirectory,
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
      type: config.webVersionCache?.type || 'none',
      path: path.join(process.cwd(), config.webVersionCache?.path || path.join(config.paths.webCacheDir, 'web-version-cache')),
      strict: Boolean(config.webVersionCache?.strict),
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
  ]);
  const client = createClient();
  const handleAntiFlood = setupAntiFlood(client);
  const handleAntiLink = setupAntiLink(client);
  setupFarewell(client);
  setupWelcome(client);

  client.on('loading_screen', () => {
    if (!runtimeState.announcedWaitingForQr) {
      runtimeState.announcedWaitingForQr = true;
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
  });

  client.on('ready', () => {
    runtimeState.reconnectAttempts = 0;
    runtimeState.announcedWaitingForQr = false;
    logger.connectionPanel('Bot conectado com sucesso', [
      `Numero do bot: ${formatPhoneDisplay(client.info?.wid?.user)}`,
      `Bot: ${config.botName} v${config.version}`,
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
      const parsedCommand = parseCommandMessage(body, context.commandPrefix || config.prefix, commands);
      if (!parsedCommand) {
        return;
      }

      const { commandName, command } = parsedCommand;
      activeCommandName = commandName;

      const execution = await resolveExecutionContext(client, message, command, parsedCommand.args, context);
      if (execution.error) {
        logger.commandRejected(command.name, 'target_context_missing', context);
        await client.sendMessage(
          context.chatId,
          phraseWarning('common.command_unavailable'),
        );
        return;
      }

      const executionContext = execution.context;
      const executionArgs = execution.args;
      const executionBody = execution.body;
      activeContext = executionContext;

      const helpSent = await maybeSendCommandHelp({
          client,
          chatId: context.chatId,
          command,
          commandPrefix: executionContext.commandPrefix,
          helpRequested: parsedCommand.helpRequested,
        });
      if (helpSent) {
        return;
      }

      const permission = validateCommandPermission(command, executionContext);
      if (!permission.allowed) {
        logger.commandRejected(command.name, permission.reason, executionContext, permission.meta || {});
        await client.sendMessage(
          context.chatId,
          phraseError(`common.${permission.reason}`),
        );
        return;
      }

      const executionResult = await executeCommand({
        client,
        message,
        command,
        args: executionArgs,
        body: executionBody,
        context: executionContext,
        commandRegistry: commands,
      });
      await finalizeCommandExecution({
        client,
        commandName: command.name,
        context: executionContext,
        durationMs: executionResult.durationMs,
      });
    } catch (runtimeError) {
      await handleCommandFailure({
        message,
        commandName: activeCommandName,
        error: runtimeError,
        context: activeContext,
      });
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
