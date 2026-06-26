# Guia para Desenvolvedores

Este documento descreve a arquitetura atual da base e o jeito mais seguro de evoluí-la.

## Objetivo da base

O projeto foi estruturado para servir como ponto de partida para outros bots de WhatsApp, com foco em:

- comandos reutilizáveis
- configuração por grupo
- operação do dono pelo privado
- persistência simples em JSON
- manutenção fácil

## Visão de arquitetura

### Entrada principal

Arquivo:

- [src/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/bot.js)

Responsabilidades:

- inicializar o `Client`
- configurar `LocalAuth`
- montar o contexto de execução
- aceitar comandos de grupo e do dono no privado
- despachar módulos automáticos
- acionar logs e notificações

### Loader de comandos

Arquivo:

- [src/core/commandLoader.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/core/commandLoader.js)

Contrato de cada comando:

- `name`
- `aliases`
- `description`
- `groupOnly`
- `adminOnly`
- `ownerOnly` opcional
- `execute(...)`

### Camadas principais

#### `commands/`

Separado por papel:

- `admin/`
- `owner/`
- `user/`

#### `modules/`

Automatizações acionadas por eventos do WhatsApp:

- [welcome.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/welcome.js)
- [farewell.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/farewell.js)
- [antiLink.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/antiLink.js)
- [antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/modules/antiFlood.js)

#### `services/`

Aqui vive a lógica mais importante da base:

- [groupSettingsService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/groupSettingsService.js)
- [whatsappIdentityService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/whatsappIdentityService.js)
- [ownerNotificationService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/ownerNotificationService.js)
- [ownerSettingsService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/ownerSettingsService.js)
- [loggerService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/loggerService.js)
- [storage/JsonFileStore.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/storage/JsonFileStore.js)

#### `utils/`

Helpers de infraestrutura:

- [wweb.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/wweb.js)
- [respond.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/respond.js)
- [text.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/text.js)

## Configuração

Arquivos-base:

- [src/config/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/bot.js)
- [src/config/paths.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/paths.js)
- [src/config/pairing.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/pairing.js)
- [src/config/connection.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/connection.js)
- [src/config/puppeteer.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/puppeteer.js)
- [src/config/features.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/features.js)
- [src/config/antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiFlood.js)
- [src/config/antiLink.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiLink.js)
- [src/config/links.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/links.js)
- [src/config/rules.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/rules.js)
- [src/config/config.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/config.js)

## Persistência

### Dados por grupo

Cada grupo ganha um JSON em:

```text
data/groups/
```

Esse arquivo inclui:

- `features`
- `antiFlood`
- `antiLink`
- `blacklist`
- `groupRules`

### Dados globais do sistema

Preferências do dono:

```text
data/system/
```

### Logs

```text
logs/bot.log
```

## Como adicionar um comando

1. escolha a pasta correta em `src/commands`
2. crie um arquivo `.js`
3. exporte o objeto do comando
4. use os serviços antes de criar lógica duplicada
5. rode `npm run smoke`

Exemplo:

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

## Como adicionar um módulo automático

1. crie o arquivo em `src/modules`
2. use `loadGroupSettings(...)` quando o comportamento depender do grupo
3. registre o módulo em [src/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/bot.js)
4. se ele for configurável, adicione a chave correspondente em [src/config/features.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/features.js)
5. ajuste `#modulos` e, se fizer sentido, um comando dedicado

## Padrão de resposta

As mensagens devem preferir [src/utils/respond.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/utils/respond.js).

Helpers disponíveis:

- `info`
- `success`
- `warning`
- `error`
- `moderation`

## Identidade WhatsApp

O projeto já trata a diferença entre `@lid` e `@c.us` via:

- [whatsappIdentityService.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/services/whatsappIdentityService.js)

Se um novo comando depender de participante, reaproveite essa camada.

## Dono do bot no privado

O dono pode operar grupos pelo privado usando:

```text
--grupo <ID_DO_GRUPO>
```

Se você adicionar comandos de grupo, tente mantê-los compatíveis com esse fluxo.

## Boas práticas para evoluir a base

- rode `npm run smoke` antes de concluir mudanças
- não duplique regra de negócio que já existe em `services/`
- mantenha comandos finos e serviços mais “inteligentes”
- preserve a configuração por grupo como fonte principal de comportamento
- registre eventos importantes no logger

## Deploy

Para VPS Ubuntu e Oracle:

- [doc/instalacao-oracle-ubuntu.md](./instalacao-oracle-ubuntu.md)

## Limitações atuais

- depende de WhatsApp Web, então continua sujeito a mudanças do cliente Web
- o foco principal ainda é uma sessão por instância
- o projeto privilegia simplicidade operacional, não alta escala
