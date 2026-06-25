const sharp = require('sharp');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../../config/config');
const { error, info, warning } = require('../../utils/respond');

module.exports = {
  name: 'figu',
  aliases: ['sticker'],
  description: 'Cria uma figurinha a partir de uma imagem respondida.',
  groupOnly: false,
  adminOnly: false,
  async execute({ client, message, chatId, quotedMessage }) {
    const targetMessage = quotedMessage || message;

    if (!targetMessage.hasMedia) {
      await client.sendMessage(
        chatId,
        warning('Figurinha', `Responda a uma imagem com *${config.prefix}figu* para criar a figurinha.`),
      );
      return;
    }

    const downloaded = await targetMessage.downloadMedia();
    if (!downloaded?.mimetype?.startsWith('image/')) {
      await client.sendMessage(
        chatId,
        error('Figurinha', `A mensagem respondida precisa conter uma imagem para usar *${config.prefix}figu*.`),
      );
      return;
    }

    await client.sendMessage(chatId, info('Figurinha', 'Gerando a figurinha...'));

    const buffer = Buffer.from(downloaded.data, 'base64');

    const stickerBuffer = await sharp(buffer)
      .rotate()
      .resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 90, effort: 4 })
      .toBuffer();

    const sticker = new MessageMedia('image/webp', stickerBuffer.toString('base64'), 'sticker.webp');

    await client.sendMessage(chatId, sticker, {
      sendMediaAsSticker: true,
      stickerName: config.botName,
      stickerAuthor: config.owner.name,
      quotedMessageId: message.id._serialized,
    });
  },
};
