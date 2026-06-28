<div align="center">
  <img src="./icons/ICON.jpg" alt="Lara Bot" width="240" />

  <h1>LARA BOT DE FIGURINHAS</h1>

  <p>
    Base moderna para bots de <strong>WhatsApp</strong> com foco em
    <strong>packs de figurinhas</strong>, <strong>automação por grupo</strong>,
    <strong>configuração granular</strong> e <strong>operação do dono no privado</strong>.
  </p>

  <p>
    <img src="https://img.shields.io/badge/node-20.x-5fa04e?style=for-the-badge&logo=node.js&logoColor=white" alt="Node 20.x" />
    <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-2f3545?style=for-the-badge" alt="Platform" />
    <img src="https://img.shields.io/badge/whatsapp-web.js-25d366?style=for-the-badge" alt="whatsapp-web.js" />
    <img src="https://img.shields.io/badge/auth-QR%20Code-5865f2?style=for-the-badge" alt="QR Code" />
    <img src="https://img.shields.io/badge/status-active-2ea043?style=for-the-badge" alt="Status" />
  </p>
</div>

---

## ✨ Visão geral

O projeto foi reestruturado para servir como fundação de outros bots. A base hoje entrega:

- packs de figurinhas com integração local via `killua-sticker-api`
- envio automático de packs aleatórios por grupo
- controle por grupo de pedido de packs por membros comuns
- bloqueio ou liberação de packs `+18` por grupo
- comandos administrativos prontos para grupo
- módulos automáticos com `on/off` por grupo
- comandos finos com regra de negócio extraída para `services/commands/`
- pipeline do bot separada em parser, contexto, permissão, execução e pós-execução
- regras, blacklist e anti-flood editáveis pelo próprio bot
- prefixo global e por grupo editável pelo próprio bot
- suporte ao dono no privado com `--grupo <ID_DO_GRUPO>`
- notificações privadas do dono com `on/off`
- logs estruturados em arquivo
- persistência simples em JSON

## 🚀 Recursos principais

- ✅ Envio manual de pack aleatório com `#pack`
- ✅ Envio manual de pack por categoria com `#pack <categoria>`
- ✅ Envio automático de pack aleatório por tempo configurável
- ✅ Bloqueio ou liberação de conteúdo `+18` por grupo
- ✅ Permissão para membros comuns pedirem packs
- ✅ Boas-vindas automáticas
- ✅ Mensagem automática quando membro sai
- ✅ Anti-link com ação por categoria: `apagar` ou `banir`
- ✅ Anti-flood com limite e janela configuráveis
- ✅ Configuração por grupo em `data/groups/`
- ✅ Operação do dono pelo privado
- ✅ Logs em `logs/bot.log`
- ✅ Estrutura preparada para derivar outros bots

## 🧩 Comandos principais

### Administração

```text
#figurinhas
#figurinhas auto on|off
#figurinhas tempo 30
#figurinhas membros on|off
#figurinhas adulto on|off
#ban @membro
#adm @membro
#sleep on|off
#tagall
#bot
#bot server
#modulos
#boasvindas on|off
#antilink on|off
#antilink acao <whatsapp|adulto|apostas> <apagar|banir>
#blacklist
#antiflood on|off
#antiflood limite <numero>
#antiflood janela <segundos>
#antiflood minimo <numero>
```

### Usuário

```text
#pack
#pack memes
#pack categorias
#menu
#help
#regras
#statusgrupo
#groupinfo
#link
#adms
```

### Dono no privado

```text
#grupos
#logs on|off
#notificacoes on|off
#prefixo status
#prefixo global !
#prefixo grupo ? --grupo 1203...@g.us
#antilink --grupo 1203...@g.us on
#boasvindas --grupo 1203...@g.us off
#antiflood --grupo 1203...@g.us limite 8
#ban --grupo 1203...@g.us 5511999999999
```

## ⚙️ Módulos automáticos

| Módulo | O que faz | Controle |
|---|---|---|
| `stickerAuto` | envia pack aleatório automaticamente pelo tempo configurado | `#figurinhas auto on/off` |
| `welcome` | envia mensagem quando alguém entra | `#boasvindas on/off` |
| `farewell` | envia mensagem quando alguém sai | `#modulos farewell on/off` |
| `antiLink` | apaga links proibidos e pode banir | `#antilink` |
| `antiFlood` | remove quem flooda repetição | `#antiflood` |

## 🧷 Sistema de figurinhas

Esta branch usa a API local:

- `apis/killua-sticker-api`

Ela lê os packs `.kpack` da pasta:

```text
apis/killua-sticker-api/packs/
```

Hoje o bot já suporta:

- packs aleatórios por comando
- packs aleatórios por categoria
- envio automático de pack por grupo
- bloqueio de packs `+18` quando a configuração do grupo estiver desligada
- liberação ou bloqueio de pedidos de pack por membros comuns

### Comandos de figurinhas

```text
#figurinhas
#figurinhas auto on
#figurinhas auto off
#figurinhas tempo 30
#figurinhas membros on
#figurinhas membros off
#figurinhas adulto on
#figurinhas adulto off
#pack
#pack anime
#pack memes
#pack categorias
```

### Regras importantes

- `#figurinhas tempo <minutos>`: apenas o dono do bot
- `#figurinhas membros on|off`: define se membros comuns podem pedir packs
- `#figurinhas adulto on|off`: define se packs `+18` ficam visíveis no grupo
- quando `adulto` estiver desligado, o automático e o manual ignoram packs `+18`

## 🧪 Grupo de teste

Você pode usar este grupo para testar os comandos da base:

- [Entrar no grupo de teste](https://chat.whatsapp.com/FyMtfvXBZBPDPpl2TA5tER)

## 🗂️ Configuração por grupo

Cada grupo ganha um arquivo próprio em:

```text
data/groups/
```

Esse arquivo guarda:

- módulos ligados e desligados
- prefixo próprio do grupo, se existir
- regras do grupo
- blacklist por categoria
- ação do anti-link por categoria
- limites do anti-flood

Os padrões para novos grupos ficam em:

- [src/config/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/bot.js)
- [src/config/config.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/config.js)
- [src/config/antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiFlood.js)
- [src/config/antiLink.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiLink.js)
- [src/config/features.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/features.js)
- [src/config/links.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/links.js)
- [src/config/message-phrases.json](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/message-phrases.json)
- [src/config/messageStyle.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/messageStyle.js)
- [src/config/rules.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/rules.js)

## 🧠 Arquitetura

```text
src/
├─ bot.js
├─ commands/
│  ├─ admin/
│  ├─ owner/
│  └─ user/
├─ config/
├─ core/
├─ modules/
├─ services/
│  ├─ bot/
│  ├─ commands/
│  └─ storage/
└─ utils/
```

### Pipeline do bot

O [src/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/bot.js) agora atua mais como orquestrador. O fluxo principal foi quebrado em:

- parser de comando:
  [src/services/bot/commandParserService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/bot/commandParserService.js)
- resolução de contexto:
  [src/services/bot/commandContextService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/bot/commandContextService.js)
- validação de permissão:
  [src/services/bot/commandPermissionService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/bot/commandPermissionService.js)
- execução:
  [src/services/bot/commandExecutionService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/bot/commandExecutionService.js)
- pós-execução:
  [src/services/bot/commandPostExecutionService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/bot/commandPostExecutionService.js)

### Camada de serviços

- [groupSettingsService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/groupSettingsService.js)
- [whatsappIdentityService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/whatsappIdentityService.js)
- [ownerNotificationService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/ownerNotificationService.js)
- [ownerSettingsService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/ownerSettingsService.js)
- [prefixService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/prefixService.js)
- [loggerService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/loggerService.js)
- [messageRenderService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/messageRenderService.js)
- [messagePhraseService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/messagePhraseService.js)
- [storage/JsonFileStore.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/storage/JsonFileStore.js)

### Serviços de comando

Os comandos estão sendo enxugados para o padrão `args -> serviço -> resposta`. A regra de negócio já começou a sair dos handlers para:

- [adminModerationService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/commands/adminModerationService.js)
- [groupFeatureCommandService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/commands/groupFeatureCommandService.js)
- [groupProtectionCommandService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/commands/groupProtectionCommandService.js)
- [featureCatalogService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/commands/featureCatalogService.js)

## 📦 Instalação rápida

```bash
npm install
npm start
```

Primeira execução:

1. o QR Code aparece no terminal
2. você escaneia com o WhatsApp
3. a sessão fica salva em `.wwebjs_auth`

Para validar a base:

```bash
npm run smoke
```

## 🔠 Prefixo do bot

O prefixo padrão da base continua sendo `#`, mas agora ele pode ser alterado sem mexer no código:

```text
#prefixo status
#prefixo global !
#prefixo global reset
#prefixo grupo ?
#prefixo grupo reset
```

Regras:

- `prefixo global`: apenas o dono do bot
- `prefixo grupo`: admin do grupo ou dono no privado com `--grupo`
- quando o grupo não tem prefixo próprio, ele herda o prefixo global

## 🔐 Sessão e dados

Pastas geradas em runtime:

```text
.wwebjs_auth/
.wwebjs_cache/
data/groups/
data/system/
logs/
```

Se precisar reautenticar:

1. pare o processo
2. apague `.wwebjs_auth`
3. rode `npm start` novamente

## 📝 Logs

Os logs ficam em:

```text
logs/bot.log
```

Por padrão, a gravação fica desligada. Para controlar:

```text
#logs on
#logs off
#logs status
```

Quando ligados, eles registram:

- comandos recebidos e concluídos
- rejeições por permissão ou contexto
- eventos automáticos por grupo
- erros com contexto

## 📚 Documentação

- [Guia de comandos](./doc/guia-de-comandos.md)
- [Guia do usuário](./doc/para%20usuarios.md)
- [Guia para desenvolvedores](./doc/para%20desenvolvedores.md)
- [Instalação na Oracle Ubuntu](./doc/instalacao-oracle-ubuntu.md)
- [Changelog](./doc/CHANGELOG.md)
