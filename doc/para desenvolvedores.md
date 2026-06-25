# Guia para Desenvolvedores

Este documento descreve a arquitetura atual da base e como evoluí-la com segurança.

## Objetivo da base

A ideia deste projeto é servir como fundação para outros bots, com:

- estrutura modular
- configuração separada
- comandos simples de expandir
- foco em grupos

## Arquitetura

### Entrada principal

Arquivo:

- [src/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/bot.js)

Responsabilidades:

- inicializar o `Client`
- configurar `LocalAuth`
- lidar com eventos do WhatsApp
- carregar comandos
- montar contexto de mensagem
- executar módulos automáticos antes dos comandos

### Loader de comandos

Arquivo:

- [src/core/commandLoader.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/core/commandLoader.js)

Cada comando exporta um objeto com:

- `name`
- `aliases`
- `description`
- `groupOnly`
- `adminOnly`
- `execute(...)`

### Módulos automáticos

Arquivos:

- [src/modules/welcome.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/welcome.js)
- [src/modules/antiLink.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/antiLink.js)
- [src/modules/antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/antiFlood.js)

Eles rodam antes da etapa de despacho de comandos.

### Helpers

Arquivos principais:

- [src/utils/wweb.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/wweb.js)
- [src/utils/respond.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/respond.js)
- [src/utils/text.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/text.js)

Funções:

- adaptar IDs e contexto do `whatsapp-web.js`
- padronizar respostas
- utilidades de formatação

## Configuração

Os arquivos em [src/config](C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config) foram separados por responsabilidade:

- `bot.js`
- `paths.js`
- `pairing.js`
- `connection.js`
- `puppeteer.js`
- `features.js`
- `antiFlood.js`
- `links.js`
- `rules.js`
- `config.js`

O restante do código importa apenas `config.js`, que agrega tudo.

## Como adicionar um comando

1. crie um arquivo em `src/commands/admin` ou `src/commands/user`
2. exporte o objeto padrão do comando
3. implemente `execute`
4. rode `npm run smoke`

Exemplo de estrutura:

```js
module.exports = {
  name: 'exemplo',
  aliases: ['alias'],
  description: 'Descricao do comando',
  groupOnly: true,
  adminOnly: false,
  async execute({ client, chatId }) {
    await client.sendMessage(chatId, 'ok');
  },
};
```

## Padrão visual

Todas as mensagens devem preferencialmente usar [src/utils/respond.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/respond.js).

Helpers disponíveis:

- `info`
- `success`
- `warning`
- `error`
- `moderation`

Isso evita respostas soltas e mantém a identidade visual do bot.

## Deploy em Ubuntu

### Requisitos do sistema

- Ubuntu 22.04+
- Node.js 20
- Google Chrome
- bibliotecas necessárias ao Puppeteer

### Passo a passo

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Instale as dependências do Chrome:

```bash
sudo apt install -y \
  ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
  libc6 libcairo2 libcups2 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 \
  libgbm1 libgcc-s1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxshmfence1 libxss1 libxtst6 lsb-release wget xdg-utils

wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

Depois:

```bash
git clone <SEU-REPO> lara-bot
cd lara-bot
npm install
npm start
```

## PM2

Para manter o processo online:

```bash
sudo npm install -g pm2
pm2 start src/bot.js --name lara-bot
pm2 save
pm2 startup
```

Logs:

```bash
pm2 logs lara-bot
```

## Boas práticas

- rode `npm run smoke` antes de subir mudanças
- não versione `.wwebjs_auth`
- não edite `config.js` diretamente se a mudança pertence a um arquivo específico
- mantenha os módulos automáticos configuráveis via `features.js`

## Limitações atuais

- depende de WhatsApp Web, então está sujeito a mudanças do cliente Web
- pairing por número existe, mas é tratado como experimental
- o foco atual é `1 sessão por instância`
