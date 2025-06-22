const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../config/config');
const fs = require('fs');

module.exports = async (sock, msg) => {
  const from = msg.key.remoteJid;

  if (!msg.message.extendedTextMessage || !msg.message.extendedTextMessage.contextInfo) {
    return sock.sendMessage(from, { text: `❗ Responda uma imagem com o comando *${config.prefix}figu* para transformá-la em figurinha.` });
  }

  const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;

  if (!quoted.imageMessage) {
    return sock.sendMessage(from, { text: `⚠️ Você deve responder uma *imagem* com comando *${config.prefix}figu* para criar a figurinha.` });
  }

  try {
    // Baixa a imagem
    const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console });

    // Cria o sticker
    const sticker = new Sticker(buffer, {
    pack: 'Lara Bot',
    author: 'Leonel Miguins',
    type: StickerTypes.FULL,
    quality: 70,
    categories: ['🤖', '✨'],
    });

    // Gera o buffer do sticker
    const stickerBuffer = await sticker.toBuffer();

    // Envia o sticker
    await sock.sendMessage(from, { sticker: stickerBuffer });
  } catch (err) {
    console.error('Erro ao gerar figurinha:', err);
    await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao tentar gerar a figurinha.' });
  }
};
