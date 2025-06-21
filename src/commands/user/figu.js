const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const tempDir = path.join(__dirname, '..', '..', 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo) {
    return sock.sendMessage(from, { text: '❗ Responda uma imagem com o comando *!figu* para transformá-la em figurinha.' });
  }

  const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

  if (!quoted.imageMessage) {
    return sock.sendMessage(from, { text: '⚠️ Você deve responder uma *imagem* para criar a figurinha.' });
  }

  try {
    const buffer = await downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger: console }
    );

    const outputPath = path.join(tempDir, `sticker-${Date.now()}.webp`);

    // Converte com sharp
    await sharp(buffer)
      .resize(512, 512, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const stickerBuffer = fs.readFileSync(outputPath);
    await sock.sendMessage(from, { sticker: stickerBuffer });

    fs.unlinkSync(outputPath); // limpa
  } catch (err) {
    console.error('Erro ao gerar figurinha:', err);
    await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao tentar gerar a figurinha.' });
  }
};
