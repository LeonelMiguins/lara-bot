# Guia do Usuário

Este guia é para quem vai operar o bot no dia a dia, sem precisar mexer no código.

## Primeiro uso

1. rode `npm start`
2. escaneie o QR Code no terminal
3. espere a mensagem de conexão
4. envie `#menu` no WhatsApp

## Prefixo

O prefixo padrão é:

```text
#
```

Agora você pode trocar isso pelo próprio bot.

Comandos:

```text
#prefixo status
#prefixo global !
#prefixo global reset
#prefixo grupo ?
#prefixo grupo reset
```

Regras:

- `global`: apenas o dono do bot
- `grupo`: admin do grupo ou dono via privado com `--grupo`
- se o grupo não tiver prefixo próprio, ele usa o prefixo global

## Comandos de grupo

### Administração

- `#ban @membro`
- `#adm @membro`
- `#sleep on|off`
- `#tagall`
- `#bot`
- `#bot server`
- `#modulos`
- `#boasvindas on|off`
- `#antilink on|off`
- `#antilink acao <categoria> <apagar|banir>`
- `#blacklist`
- `#antiflood on|off`
- `#antiflood limite <numero>`
- `#antiflood janela <segundos>`
- `#antiflood minimo <numero>`

### Usuário

- `#menu`
- `#regras`
- `#statusgrupo`
- `#groupinfo`
- `#link`
- `#adms`

## Configuração por grupo

Cada grupo guarda sua própria configuração automaticamente. Isso significa que:

- um grupo pode ter `antiFlood` ligado e outro desligado
- um grupo pode só apagar links, outro pode apagar e banir
- as regras podem ser diferentes entre grupos

## Módulos automáticos

### Boas-vindas

Controla a mensagem automática quando alguém entra.

```text
#boasvindas on
#boasvindas off
```

### Saída de membros

Controla a mensagem automática quando alguém sai.

```text
#modulos farewell on
#modulos farewell off
```

### Anti-link

O anti-link pode ser ligado ou desligado:

```text
#antilink on
#antilink off
```

Além disso, você pode definir a ação por categoria:

```text
#antilink acao whatsapp banir
#antilink acao adulto apagar
#antilink acao apostas apagar
```

Categorias aceitas:

- `whatsapp`
- `adulto`
- `apostas`

### Anti-flood

Liga e desliga:

```text
#antiflood on
#antiflood off
```

Ajustes:

```text
#antiflood limite 8
#antiflood janela 15
#antiflood minimo 2
```

## Regras do grupo

Visualizar:

```text
#regras
```

Editar:

```text
#regras add Respeite todos os membros.
#regras del 2
#regras reset
```

## Blacklist

Listar:

```text
#blacklist
```

Remover ou restaurar:

```text
#blacklist del adulto 1
#blacklist reset adulto
```

Para adicionar novas palavras-chave:

- edite direto o JSON do grupo em `data/groups/`

## Dono no privado

O dono do bot pode operar no privado usando:

- `#grupos`
- `#logs on|off`
- `#notificacoes on|off`
- `#prefixo status`
- `#prefixo global !`
- `--grupo <ID_DO_GRUPO>`

Exemplo:

```text
#antiflood --grupo 1203...@g.us limite 8
```

## Notificações privadas do dono

O bot pode mandar no privado do dono eventos como:

- comando executado
- banimento
- promoção de admin
- anti-link
- anti-flood

Liga e desliga com:

```text
#notificacoes on
#notificacoes off
```

## Logs

A gravação de logs do bot também pode ser ligada ou desligada pelo dono:

```text
#logs on
#logs off
#logs status
```

Quando ativados, os logs ficam em:

```text
logs/bot.log
```

## Se a sessão quebrar

1. pare o bot
2. apague `.wwebjs_auth`
3. rode `npm start`
4. escaneie o QR novamente

## Onde buscar mais detalhes

- [README.md](../README.md)
- [doc/guia-de-comandos.md](./guia-de-comandos.md)
- [doc/para desenvolvedores.md](./para%20desenvolvedores.md)
- [doc/instalacao-oracle-ubuntu.md](./instalacao-oracle-ubuntu.md)
