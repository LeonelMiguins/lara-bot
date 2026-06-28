# Guia de Comandos

Este documento lista todos os comandos atuais do bot, com finalidade, permissão, local de uso e exemplos.

## Regras gerais

### Prefixo

O prefixo padrão é:

```text
#
```

Hoje esse prefixo pode ser alterado sem editar arquivo:

```text
#prefixo global !
#prefixo grupo ?
```

### Tipos de comando

- `Usuário`: qualquer membro pode usar
- `Admin`: apenas administradores do grupo
- `Dono`: apenas o dono do bot

### Locais de uso

- `Grupo`: só funciona dentro de grupos
- `Privado`: só faz sentido no privado do bot
- `Grupo e Privado`: pode funcionar nos dois, normalmente para o dono

### Dono no privado com grupo alvo

O dono pode usar comandos de grupo no privado do bot com:

```text
--grupo <ID_DO_GRUPO>
```

Exemplo:

```text
#antilink --grupo 1203...@g.us on
```

---

## Comandos de administração

### `#adm`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#promote`
- Função: promove um membro a administrador

Como usar:

```text
#adm @membro
```

Ou respondendo a mensagem do membro:

```text
#adm
```

O dono também pode usar no privado:

```text
#adm --grupo 1203...@g.us 5511999999999
```

---

### `#ban`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#kick`
- Função: remove um membro do grupo

Como usar:

```text
#ban @membro
```

Ou respondendo a mensagem do membro:

```text
#ban
```

O dono também pode usar no privado:

```text
#ban --grupo 1203...@g.us 5511999999999
```

---

### `#sleep`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#grupo`
- Função: fecha ou reabre o grupo para mensagens

Como usar:

```text
#sleep on
#sleep off
```

`on`:
- só administradores podem enviar mensagens

`off`:
- todos os membros podem voltar a enviar mensagens

---

### `#tagall`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#hidetag`
- Função: menciona todos os membros do grupo

Como usar:

```text
#tagall
```

---

### `#bot`

- Tipo: `Admin`
- Local: `Grupo`
- Função: mostra informações do bot

Como usar:

```text
#bot
```

Informações mostradas:

- nome do bot
- versão
- número do bot
- nome do dono

Subcomando:

```text
#bot server
```

Mostra:

- CPU
- RAM livre
- RAM total
- sistema operacional
- uptime do host

---

## Comando de prefixo

### `#prefixo`

- Tipo: `Dono` para `global`
- Tipo: `Admin` ou `Dono` para `grupo`
- Local: `Grupo e Privado`
- Alias: `#prefix`, `#setprefix`
- Função: mostra ou altera o prefixo global do bot e o prefixo específico de um grupo

Como usar:

```text
#prefixo status
#prefixo global !
#prefixo global reset
#prefixo grupo ?
#prefixo grupo reset
```

No privado do dono, também funciona com grupo alvo:

```text
#prefixo grupo ! --grupo 1203...@g.us
#prefixo grupo reset --grupo 1203...@g.us
```

Regras:

- `global`: só o dono pode alterar
- `grupo`: admin do grupo ou dono no privado
- se o grupo não tiver prefixo próprio, ele herda o prefixo global

---

### `#modulos`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#modules`, `#features`
- Função: lista e liga/desliga módulos automáticos

Como usar:

```text
#modulos
```

Liga ou desliga:

```text
#modulos welcome on
#modulos welcome off
#modulos farewell on
#modulos farewell off
#modulos antiLink on
#modulos antiLink off
#modulos antiFlood on
#modulos antiFlood off
```

Módulos aceitos:

- `welcome`
- `farewell`
- `antiLink`
- `antiFlood`

---

### `#boasvindas`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#welcome`, `#bemvindo`, `#bemvindos`
- Função: controla apenas o módulo de boas-vindas

Como usar:

```text
#boasvindas
#boasvindas on
#boasvindas off
```

---

### `#antilink`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#antilinks`
- Função: controla o módulo de anti-link e a ação por categoria

Como usar:

```text
#antilink
#antilink on
#antilink off
```

Definir a ação por categoria:

```text
#antilink acao whatsapp apagar
#antilink acao whatsapp banir
#antilink acao adulto apagar
#antilink acao adulto banir
#antilink acao apostas apagar
#antilink acao apostas banir
```

Restaurar o padrão da base:

```text
#antilink reset whatsapp
#antilink reset adulto
#antilink reset apostas
```

Categorias aceitas:

- `whatsapp`
- `adulto`
- `apostas`

Ações aceitas:

- `apagar`
- `banir`

---

### `#blacklist`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#bloqueios`
- Função: lista a blacklist por categoria e permite remover entradas existentes

Como usar:

```text
#blacklist
```

Remover por número:

```text
#blacklist del adulto 1
```

Remover por domínio:

```text
#blacklist del adulto exemploadulto.com
```

Restaurar padrão:

```text
#blacklist reset whatsapp
#blacklist reset adulto
#blacklist reset apostas
```

Categorias aceitas:

- `whatsapp`
- `adulto`
- `apostas`

Observação:

- novas palavras-chave devem ser adicionadas direto no JSON do grupo em `data/groups/`

---

### `#antiflood`

- Tipo: `Admin`
- Local: `Grupo`
- Alias: `#flood`
- Função: mostra e edita o comportamento do anti-flood

Como usar:

```text
#antiflood
```

Liga ou desliga:

```text
#antiflood on
#antiflood off
```

Ajustar limite:

```text
#antiflood limite 8
```

Ajustar janela:

```text
#antiflood janela 15
```

Ajustar tamanho mínimo da mensagem:

```text
#antiflood minimo 2
```

Restaurar padrão:

```text
#antiflood reset
```

---

## Comandos do dono

### `#grupos`

- Tipo: `Dono`
- Local: `Privado`
- Aliases: `#groups`, `#listagrupos`, `#todosgrupos`
- Função: lista todos os grupos em que o bot está inserido

Como usar:

```text
#grupos
```

Mostra:

- total de grupos
- nome do grupo
- ID do grupo

Esse comando é útil para copiar o ID e usar com `--grupo`.

---

### `#notificacoes`

- Tipo: `Dono`
- Local: `Privado`
- Aliases: `#notificacoesdono`, `#privado`
- Função: liga ou desliga as notificações privadas do dono

Como usar:

```text
#notificacoes
#notificacoes on
#notificacoes off
```

Quando ligadas, o bot pode te avisar sobre:

- comandos executados
- promoções de administrador
- remoções
- ações de anti-link
- ações de anti-flood

---

### `#logs`

- Tipo: `Dono`
- Local: `Privado`
- Alias: `#log`
- Função: liga ou desliga a gravação de logs do bot

Como usar:

```text
#logs
#logs status
#logs on
#logs off
```

Observação:

- o estado fica salvo em `data/system/owner-settings.json`
- quando desligado, o bot não grava em `logs/bot.log`

---

## Comandos de usuário

### `#menu`

- Tipo: `Usuário`
- Local: `Grupo e Privado`
- Alias: `#help`
- Função: mostra o menu principal do bot

Como usar:

```text
#menu
```

---

### `#regras`

- Tipo: `Usuário`
- Local: `Grupo`
- Alias: `#rules`
- Função: mostra as regras do grupo

Como usar:

```text
#regras
```

### Edição das regras

- Tipo: `Admin`
- Local: `Grupo`

Adicionar:

```text
#regras add Respeite todos os membros.
```

Remover:

```text
#regras del 2
```

Restaurar padrão:

```text
#regras reset
```

Listar explicitamente:

```text
#regras list
```

---

### `#statusgrupo`

- Tipo: `Usuário`
- Local: `Grupo`
- Aliases: `#grupostatus`, `#status`
- Função: mostra um resumo rápido do grupo

Como usar:

```text
#statusgrupo
```

Mostra:

- nome do grupo
- total de membros
- total de admins
- módulos ligados
- se o link está liberado
- status atual do anti-flood
- limite e janela atuais

---

### `#groupinfo`

- Tipo: `Usuário`
- Local: `Grupo`
- Alias: `#infogroup`
- Função: mostra informações do grupo

Como usar:

```text
#groupinfo
```

Mostra:

- nome
- ID
- quantidade de membros
- quantidade de admins
- descrição

---

### `#link`

- Tipo: `Usuário`
- Local: `Grupo`
- Alias: `#invite`
- Função: mostra o link de convite do grupo

Como usar:

```text
#link
```

Observação:

- o bot precisa ser administrador para gerar o link

---

### `#adms`

- Tipo: `Usuário`
- Local: `Grupo`
- Alias: `#admins`
- Função: menciona todos os administradores do grupo

Como usar:

```text
#adms
```

---

## Resumo rápido por perfil

### Membro comum

- `#menu`
- `#regras`
- `#statusgrupo`
- `#groupinfo`
- `#link`
- `#adms`

### Admin do grupo

Tudo do membro comum, mais:

- `#ban`
- `#adm`
- `#sleep`
- `#tagall`
- `#bot`
- `#modulos`
- `#boasvindas`
- `#antilink`
- `#blacklist`
- `#antiflood`
- edição em `#regras`

### Dono do bot

Tudo acima, e no privado:

- `#grupos`
- `#logs`
- `#notificacoes`
- `#prefixo`
- comandos com `--grupo <ID>`
