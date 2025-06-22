// commands/menu.js
const config = require('../config/config');
module.exports = async (sock, msg, args) => {
  const from = msg.key.remoteJid;

  const menuMessage = `
╭━━━〔 *${config.botName} MENU* 〕

 👨‍✈️ *[ᴘᴀʀᴀ ᴀᴅᴍꜱ]彡*      
                                
*${config.prefix}𝚋𝚊𝚗 [@𝚞𝚜𝚞á𝚛𝚒𝚘]* - 𝙱𝚊𝚗𝚎
*${config.prefix}𝚊𝚍𝚖 [@𝚞𝚜𝚞á𝚛𝚒𝚘]* - 𝙿𝚛𝚘𝚖𝚘𝚟𝚎
*${config.prefix}𝚜𝚕𝚎𝚎𝚙* - 𝚂𝚒𝚕𝚎𝚗𝚌𝚒𝚊 𝚘 𝚐𝚛𝚞𝚙𝚘
*${config.prefix}𝚝𝚊𝚐𝚊𝚕𝚕* - 𝙼𝚊𝚛𝚌𝚊 𝚖𝚎𝚖𝚋𝚛𝚘𝚜 
*${config.prefix}𝚋𝚘𝚝* - 𝙶𝚎𝚛𝚎𝚗𝚌𝚒𝚊 𝚋𝚘𝚝
     
 🏆 *[ʀᴀɴᴋ]彡*

 *${config.prefix}𝚝𝚘𝚙* - 𝚃𝚘𝚙 𝙼𝚎𝚖𝚋𝚛𝚘𝚜
 *${config.prefix}𝚛𝚊𝚗𝚔 𝚑𝚎𝚕𝚙* - Ajuda
 *${config.prefix}𝚛𝚊𝚗𝚔 𝚘𝚗/𝚘𝚏𝚏* - 𝚊𝚝𝚒𝚟𝚊 𝚘 𝚛𝚊𝚗𝚔
 *${config.prefix}𝚜𝚝𝚊𝚝𝚞𝚜 [@𝚞𝚜𝚞á𝚛𝚒𝚘]* - 𝚟𝚎𝚛
 *${config.prefix}𝚜tore* - L𝚘𝚓𝚒𝚗𝚑𝚊 𝚍𝚘 𝚐𝚛𝚞𝚙𝚘
 *${config.prefix}𝚋𝚞𝚢 [𝙸𝚝𝚎𝚖]* - 𝙲𝚘𝚖𝚙𝚛a 𝙸𝚝𝚎𝚖
     
 👥 *[ɢʀᴜᴘᴏꜱ]彡*

  *${config.prefix}𝚛𝚎𝚐𝚛𝚊𝚜*
  *${config.prefix}𝚏𝚒𝚐𝚞 [𝚒𝚖𝚊𝚐𝚎𝚖]*
  *${config.prefix}𝚕𝚒𝚗𝚔 - 𝙻𝚒𝚗𝚔 𝚍𝚘 𝚐𝚛𝚞𝚙𝚘*
  *${config.prefix}𝚍𝚛𝚒𝚗𝚔 [@𝚞𝚜𝚞á𝚛𝚒𝚘] - 𝙿𝚊𝚐𝚊 𝚋𝚎𝚋𝚒𝚍𝚊*
  *${config.prefix}𝚍𝚛𝚒𝚗𝚔 𝚊𝚕𝚕 - 𝙿𝚊𝚐𝚊 𝚙𝚊𝚛𝚊 𝚝𝚘𝚍𝚘𝚜!*
  *${config.prefix}𝚊𝚍𝚖𝚜 - 𝚂𝚘𝚕𝚒𝚌𝚒𝚝𝚊𝚛!*

╰━━━━━━━━━━━━━━━━━━━━━━━╯
`;

  await sock.sendMessage(from, { text: menuMessage });
};
