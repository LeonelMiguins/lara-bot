const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const config = require('./config/config');
const { getHourMinute, loadCommands } = require('./functions/globalFunctions');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const setupWelcome = require('./commands/auto/welcome');
const antiLink = require('./commands/auto/antiLink');
const processRank = require('./commands/rank/func/rankSystem');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
  });

  setupWelcome(sock);

  const commands = loadCommands(path.join(__dirname, 'commands'), ['welcome.js']);

  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr) qrcode.generate(qr, { small: true });

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexão encerrada. Reconectar?', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ Conectado com sucesso!');
      console.log(`✅ Rodando ${config.botName}`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

    await antiLink(sock, msg);

    const isCommand = body.startsWith(config.prefix); // prefixo do bot no arquivo config.js 
    if (!isCommand) {
      await processRank(sock, msg);
      return;
    }

    const args = body.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = commands[commandName];
    if (command) {
      try {
        await command(sock, msg, args);
      } catch (error) {
        console.error(`Erro no comando ${commandName}:`, error);
        await sock.sendMessage(from, { text: `❌ Erro ao executar o comando ${commandName}` });
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

startBot();

setInterval(() => {
  if (!global._rankCache) return;

  const timestamp = getHourMinute();

  for (const file in global._rankCache) {
    fs.writeFileSync(file, JSON.stringify(global._rankCache[file], null, 2));
    console.log(`[${timestamp}] [⬆️ RANK] Dados Atualizados!`);
  }
  global._rankCache = {};
}, 5 * 60 * 1000); // Salva a cada 5 minutos
