const fs = require('fs');
const path = require('path');
const os = require('os');
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
    await sock.sendMessage(from, {
      text: '⏳ Aguarde, gerando sua figurinha...'
    });

    const buffer = await downloadMediaMessage({ message: quoted }, 'buffer', {}, { logger: console });

    const fileId = Date.now();
    const inputPath = path.join(tempDir, `img-${fileId}.jpg`);
    const outputPath = path.join(tempDir, `img-${fileId}.webp`);

    fs.writeFileSync(inputPath, buffer);

    /*const ffmpegPath = os.platform() === 'win32'
      ? 'C:/ffmpeg/bin/ffmpeg.exe'
      : 'ffmpeg';*/

    const ffmpegPath = 'ffmpeg';


    const comando = `"${ffmpegPath}" -i "${inputPath}" -vcodec libwebp -filter:v fps=15 -lossless 1 -preset default -loop 0 -an -vsync 0 "${outputPath}"`;

    exec(comando, async (error) => {
      if (error || !fs.existsSync(outputPath)) {
        console.error('❗ Erro ao converter imagem com FFmpeg:', error);
        return await sock.sendMessage(from, { text: '❗ Ocorreu um erro ao converter a imagem para figurinha.' });
      }

      const webpBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, { sticker: webpBuffer });

      // Apaga arquivos temporários
      try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch (e) {
        console.warn('⚠️ Falha ao apagar arquivos temporários:', e);
      }
    });

  } catch (err) {
    console.error('❗ Erro geral ao criar figurinha:', err);
    await sock.sendMessage(from, {
      text: '❗ Ocorreu um erro ao tentar gerar a figurinha.'
    });
  }
};
