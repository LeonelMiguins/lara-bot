const fs = require('fs');
const path = require('path');

module.exports = {

  /**
   * Retorna o nome de exibição de um contato a partir do JID.
   * Se falhar, retorna o número como fallback.
   * 
   * @param {string} jid - ID do WhatsApp, ex: 5599999999999@s.whatsapp.net
   * @param {import('@whiskeysockets/baileys').WASocket} sock - Instância ativa do socket
   * @returns {Promise<string>} - Nome de exibição ou número com @
   */
  formatUserName: async (jid, sock) => {
    const number = jid.split('@')[0];
    try {
      const name = await sock.getName(jid);
      return name || `@${number}`;
    } catch (err) {
      return `@${number}`;
    }
  },

  /**
   * Retorna hora e minuto no formato HH:MM
   */
  getHourMinute() {
    const now = new Date();
    const hora = now.getHours().toString().padStart(2, '0');
    const minutos = now.getMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
  },

  /**
   * Carrega comandos da pasta especificada, com opção de ignorar arquivos
   * 
   * @param {string} dir - Diretório base
   * @param {string[]} ignoreFiles - Arquivos a ignorar
   * @returns {object} - Objeto com os comandos carregados
   */
  loadCommands(dir, ignoreFiles = []) {
    const commands = {};

    function read(dirPath) {
      fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          read(fullPath);
        } else if (file.endsWith('.js') && !ignoreFiles.includes(file)) {
          const commandName = file.slice(0, -3).toLowerCase();
          commands[commandName] = require(fullPath);
        }
      });
    }

    read(dir);
    return commands;
  }

};
