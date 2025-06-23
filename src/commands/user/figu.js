const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../config/config');

const tempDir = path.join(__dirname, '..', '..', 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (!msg.message?.extendedTextMessage?.contextInfo) {
    return sock.sendMessage(from, {
      text: `❗ Responda uma imagem com o comando *${config.prefix}figu* para transformá-la em figurinha.`
    });
  }

  const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
  if (!quoted?.imageMessage) {
    return sock.sendMessage(from, {
      text: `❗ Você deve responder uma *imagem* com o comando *${config.prefix}figu* para criar a figurinha.`
    });
  }

  try {

    // Envia mensagem de espera
    const waitMsg = await sock.sendMessage(from, {
      text: '⏳ Aguarde, gerando sua figurinha...'
    });

    const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console });

    const fileId = Date.now();
    const inputPath = path.join(tempDir, `img-${fileId}.jpg`);
    const outputPath = path.join(tempDir, `img-${fileId}.webp`);

    fs.writeFileSync(inputPath, buffer);

    // Usa npx para garantir compatibilidade
    exec(`npx cwebp "${inputPath}" -q 80 -o "${outputPath}"`, async (error) => {
      if (error) {
        console.error('❗ Erro ao converter imagem:', error);
        return await sock.sendMessage(from, { text: '❗ Ocorreu um erro ao converter a imagem para figurinha.' });
      }

      const webpBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, { sticker: webpBuffer });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error('❗ Erro geral ao criar figurinha:', err);
    await sock.sendMessage(from, {
      text: '❗ Ocorreu um erro ao tentar gerar a figurinha.'
    });
  }
};
