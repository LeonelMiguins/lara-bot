const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config/config');
const { loadCommands } = require('./core/commandLoader');
const setupAntiFlood = require('./modules/antiFlood');
const setupAntiLink = require('./modules/antiLink');
const setupWelcome = require('./modules/welcome');
const { error: errorMessage } = require('./utils/respond');
const { nowLabel, digitsOnly } = require('./utils/text');
const {
  ensureDirectory,
  findParticipantById,
  getParticipantId,
  getChatMetadata,
  getMentionedIds,
  getQuotedMessage,
  getSenderId,
  isAdminParticipant,
  isSameWhatsAppId,
  isGroupId,
  normalizeUserId,
  resolveUserAliases,
} = require('./utils/wweb');

const runtimeState = {
  reconnectAttempts: 0,
  stopReconnect: false,
  announcedWaitingForQr: false,
  pairingCodeRequested: false,
};

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
  const { chat, chatId, chatName, isGroup } = await getChatMetadata(message);
  const senderId = normalizeUserId(await getSenderId(message));
  const mentions = await getMentionedIds(message);
  const quotedMessage = await getQuotedMessage(message);
  const me = await message.client.getContactById(message.client.info.wid._serialized);
  const meId = normalizeUserId(me.id._serialized);

  let senderIsAdmin = false;
  let botIsAdmin = false;
  let participants = [];

  if (isGroup) {
    participants = chat.participants || [];
    const [senderAliases, meAliases] = await Promise.all([
      resolveUserAliases(message.client, senderId),
      resolveUserAliases(message.client, meId),
    ]);

    senderIsAdmin = Array.from(senderAliases).some((alias) =>
      isAdminParticipant(findParticipantById(participants, alias)),
    );
    botIsAdmin = Array.from(meAliases).some((alias) =>
      isAdminParticipant(findParticipantById(participants, alias)),
    );
  }

  return {
    chat,
    chatId,
    chatName,
    isGroup,
    senderId,
    senderIsAdmin,
    botIsAdmin,
    participants,
    mentions,
    quotedMessage,
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
  const client = createClient();
  const handleAntiFlood = setupAntiFlood(client);
  const handleAntiLink = setupAntiLink(client);
  setupWelcome(client);

  client.on('loading_screen', () => {
    if (!runtimeState.announcedWaitingForQr) {
      runtimeState.announcedWaitingForQr = true;
      console.log(`[${nowLabel()}] Iniciando cliente do WhatsApp Web...`);
    }
  });

  client.on('qr', (qr) => {
    runtimeState.announcedWaitingForQr = false;
    runtimeState.pairingCodeRequested = false;
    console.log(`[${nowLabel()}] QR Code gerado. Escaneie com o WhatsApp.`);
    qrcode.generate(qr, { small: true });
  });

  client.on('code', (code) => {
    runtimeState.pairingCodeRequested = true;
    console.log(`[${nowLabel()}] Codigo de pareamento: ${code}`);
  });

  client.on('authenticated', () => {
    runtimeState.reconnectAttempts = 0;
    console.log(`[${nowLabel()}] Sessao autenticada com sucesso.`);
  });

  client.on('ready', () => {
    runtimeState.reconnectAttempts = 0;
    runtimeState.announcedWaitingForQr = false;
    console.log(`[${nowLabel()}] Conectado com sucesso: ${config.botName}`);
  });

  client.on('auth_failure', (message) => {
    console.error(`[${nowLabel()}] Falha de autenticacao: ${message}`);
  });

  client.on('disconnected', async (reason) => {
    const maxReconnectAttempts = config.connection.maxReconnectAttempts ?? 6;
    const reconnectDelayMs = config.connection.reconnectDelayMs ?? 3000;

    console.log(`[${nowLabel()}] Conexao encerrada: ${reason}`);

    runtimeState.reconnectAttempts += 1;
    if (runtimeState.reconnectAttempts >= maxReconnectAttempts) {
      runtimeState.stopReconnect = true;
      console.log(`Limite de ${maxReconnectAttempts} reconexoes atingido. Encerrando para evitar loop.`);
      return;
    }

    try {
      await client.destroy();
    } catch {}

    await sleep(reconnectDelayMs);
    startBot();
  });

  client.on('message', async (message) => {
    try {
      const context = await buildMessageContext(message);

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
      if (!body.startsWith(config.prefix)) {
        return;
      }

      const parts = body.slice(config.prefix.length).trim().split(/\s+/).filter(Boolean);
      if (!parts.length) {
        return;
      }

      const commandName = parts.shift().toLowerCase();
      const command = commands.get(commandName);
      if (!command) {
        return;
      }

      if (command.groupOnly && !context.isGroup) {
        await client.sendMessage(context.chatId, errorMessage('Comando indisponivel', 'Esse comando so pode ser usado em grupos.'));
        return;
      }

      if (command.adminOnly && !context.senderIsAdmin) {
        console.warn(
          `[${nowLabel()}] [ADMIN-CHECK] sender=${context.senderId} chat=${context.chatId} falhou na validacao de admin. participantes=${context.participants
            .map((participant) => `${getParticipantId(participant)}:${isAdminParticipant(participant) ? 'admin' : 'membro'}`)
            .join(', ')}`,
        );
        await client.sendMessage(context.chatId, errorMessage('Permissao negada', 'Apenas administradores podem usar esse comando.'));
        return;
      }

      await command.execute({
        client,
        message,
        args: parts,
        body,
        ...context,
      });
    } catch (runtimeError) {
      console.error('Erro ao processar mensagem:', runtimeError);
      try {
        await message.reply(errorMessage('Falha no comando', 'Ocorreu um erro ao executar esse comando.'));
      } catch {}
    }
  });

  await client.initialize();
}

startBot().catch((error) => {
  console.error('Falha fatal ao iniciar o bot:', error);
  process.exitCode = 1;
});
