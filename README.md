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

## Recursos da base

### Comandos administrativos

- `#ban`
- `#adm`
- `#sleep on|off`
- `#tagall`
- `#bot`
- `#bot server`
- `#groupinfo`
- `#boasvindas on|off`
- `#antilink on|off`
- `#blacklist`
- `#antiflood`

### Comandos de usuário

- `#menu`
- `#regras`
- `#link`
- `#adms`

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
├─ services/
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

Os arquivos de configuração-base foram divididos por responsabilidade:

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

## Configuração por grupo

Cada grupo agora recebe um arquivo próprio em:

- `data/groups/`

Na primeira interação do grupo com o bot, um arquivo `.json` é criado automaticamente com:

- módulos automáticos
- regras
- blacklist
- configurações do anti-flood

Os arquivos em `src/config/` funcionam como valores padrão para novos grupos.

O grupo também pode ser ajustado pelo próprio bot com comandos administrativos:

- `#modulos`
- `#boasvindas on|off`
- `#antilink on|off`
- `#regras add|del|reset`
- `#blacklist add|del|reset`
- `#antiflood on|off|limite|janela|minimo|reset`

## Comandos do dono no privado

O dono do bot agora pode usar comandos no privado e apontar um grupo alvo com:

- `--grupo <ID_DO_GRUPO>`

Exemplos:

- `#grupos`
- `#notificacoes on`
- `#antilink --grupo 1203...@g.us on`
- `#boasvindas --grupo 1203...@g.us off`
- `#antiflood --grupo 1203...@g.us limite 8`
- `#ban --grupo 1203...@g.us 5511999999999`
- `#adm --grupo 1203...@g.us 5511999999999`

Comandos privados do dono:

- `#grupos`: lista os grupos e os IDs
- `#notificacoes on|off`: liga ou desliga alertas privados do bot

## Camada de serviços

O projeto agora possui uma camada dedicada em `src/services/` para separar responsabilidades:

- `storage/JsonFileStore.js`: persistência JSON reutilizável
- `groupSettingsService.js`: leitura, criação, migração simples e atualização das configurações por grupo
- `whatsappIdentityService.js`: resolução de identidade `lid/c.us`, busca de participantes e checagens relacionadas ao WhatsApp
- `loggerService.js`: logs padronizados de runtime, comandos, grupos e erros com contexto

## Logs

Os logs do bot agora são salvos em:

- `logs/bot.log`

Eles incluem:

- recebimento e conclusão de comandos
- rejeições por permissão ou contexto
- eventos por grupo
- erros com contexto do chat e do remetente

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
