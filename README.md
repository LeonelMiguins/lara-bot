# Lara Bot Base

Base de bot para WhatsApp construída com `whatsapp-web.js`, pensada para servir de ponto de partida para outros bots.

O projeto hoje prioriza:

- administração de grupos
- módulos automáticos
- deploy simples em Linux
- manutenção fácil via configuração separada

## Stack

- Node.js 20+
- `whatsapp-web.js`
- `LocalAuth`
- `qrcode-terminal`
- `sharp`

## Recursos da base

### Comandos administrativos

- `#ban`
- `#adm`
- `#sleep on|off`
- `#tagall`
- `#bot`
- `#bot server`
- `#groupinfo`

### Comandos de usuário

- `#menu`
- `#regras`
- `#link`
- `#adms`
- `#figu`

### Módulos automáticos

- boas-vindas
- anti-link
- anti-flood por repetição

## Estrutura

```text
src/
├─ bot.js
├─ commands/
│  ├─ admin/
│  └─ user/
├─ config/
├─ core/
├─ modules/
└─ utils/
```

## Instalação local

```bash
npm install
npm start
```

Na primeira execução, o bot mostra um QR Code no terminal.

## Sessão

O bot usa `LocalAuth` e salva sessão em:

- `.wwebjs_auth`
- `.wwebjs_cache`

Essas pastas não devem ser versionadas.

Se precisar forçar uma nova autenticação:

1. pare o processo
2. apague `.wwebjs_auth`
3. rode `npm start` novamente

## Configuração

Os arquivos de configuração foram divididos por responsabilidade:

```text
src/config/
├─ bot.js
├─ paths.js
├─ pairing.js
├─ connection.js
├─ puppeteer.js
├─ features.js
├─ antiFlood.js
├─ links.js
├─ rules.js
└─ config.js
```

Arquivos mais úteis no dia a dia:

- [src/config/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/bot.js): nome do bot, prefixo e dono
- [src/config/features.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/features.js): liga e desliga módulos
- [src/config/links.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/links.js): blacklist de links
- [src/config/antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiFlood.js): limite e janela do anti-flood
- [src/config/rules.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/rules.js): texto do comando `#regras`

## Visual das mensagens

As respostas do bot usam um formatter central em [src/utils/respond.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/respond.js), para manter identidade visual consistente em:

- mensagens informativas
- confirmações
- alertas
- erros
- moderação automática

## Pairing por número

O projeto mantém suporte experimental a pairing por número em [src/config/pairing.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/pairing.js), mas o modo recomendado continua sendo `QR`.

Se for usar em produção, prefira QR.

## VPS Ubuntu

Resumo rápido:

1. instalar Node 20
2. instalar Google Chrome e dependências do Puppeteer
3. rodar `npm install`
4. iniciar com `npm start`
5. manter com `pm2`

Detalhamento completo:

- [doc/para usuarios.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/para usuarios.md)
- [doc/para desenvolvedores.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/para desenvolvedores.md)

## Scripts

- `npm start`: inicia o bot
- `npm run smoke`: valida carregamento dos comandos

## Validação recomendada

Antes de subir alterações:

```bash
npm run smoke
```

## Documentação adicional

- [doc/para usuarios.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/para usuarios.md)
- [doc/para desenvolvedores.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/para desenvolvedores.md)
- [doc/instalacao-oracle-ubuntu.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/instalacao-oracle-ubuntu.md)
- [doc/CHANGELOG.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/CHANGELOG.md)
