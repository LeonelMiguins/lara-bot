const { getHourMinute} = require('../../functions/globalFunctions');
const config = require('../../config/config');

function extractText(msg) {
  if (!msg.message) return null;

  if (msg.message.conversation) return msg.message.conversation;
  if (msg.message.extendedTextMessage) return msg.message.extendedTextMessage.text;
  if (msg.message.imageMessage?.caption) return msg.message.imageMessage.caption;
  if (msg.message.videoMessage?.caption) return msg.message.videoMessage.caption;
  if (msg.message.documentMessage?.caption) return msg.message.documentMessage.caption;
  if (msg.message.audioMessage?.caption) return msg.message.audioMessage.caption;

  return null;
}

module.exports = async function autoBanLinks(sock, msg) {
  timestamp = getHourMinute();
  const sender = msg.key.participant || msg.key.remoteJid;
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
  if (sender === botNumber || msg.key.fromMe) return;

  const from = msg.key.remoteJid;
  const text = extractText(msg);
  if (!from.endsWith('@g.us') || !text) return;

  const lowerText = text.toLowerCase();
  const urlRegex = /(https?:\/\/)?(www\.)?[\w-]+\.\w{2,}(\S*)?/gi;
  const urls = lowerText.match(urlRegex);
  if (!urls) return;

  // Pega as listas do config
  const { whatsappGroupLinks, adultSites, betsSites } = config.blacklist;

  const containsAny = (arr) => urls.some(url => arr.some(site => url.includes(site)));

  if (containsAny(whatsappGroupLinks)) {
    await sock.sendMessage(from, { delete: msg.key });
    await sock.groupParticipantsUpdate(from, [sender], 'remove');
    await sock.sendMessage(from, {
      text: `⛔ Membro banido!\nMotivo: Compartilhar links de grupos, comunidades ou canais do WhatsApp não é permitido aqui.`,
      mentions: [sender]
    });
    console.log(`[${timestamp}] [⛔ AUTOBAN] ${sender} Banido por enviar link de grupo WhatsApp.`);
    return;
  }

  if (containsAny(adultSites)) {
    await sock.sendMessage(from, { delete: msg.key });
    await sock.sendMessage(from, {
      text: `⚠️ Links com conteúdo adulto não são permitidos neste grupo.`,
      mentions: [sender]
    });
    console.log(`[${timestamp}] [⛔ AUTODELETE] Link adulto apagado!!`);
    return;
  }

  if (containsAny(betsSites)) {
    await sock.sendMessage(from, { delete: msg.key });
    await sock.sendMessage(from, {
      text: `⚠️ Links de apostas não são permitidos neste grupo.`,
      mentions: [sender]
    });
    console.log(`[${timestamp}] [⛔ AUTODELETE] ${sender} Link de aposta apagado!`);
    return;
  }
};
