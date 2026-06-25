# Guia do Usuário

Este guia explica como usar o bot no dia a dia.

## Primeiro uso

1. rode o projeto com `npm start`
2. escaneie o QR Code exibido no terminal
3. espere o bot conectar
4. envie `#menu` no WhatsApp

## Prefixo

O prefixo padrão é:

```text
#
```

Você pode alterar isso em [src/config/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/bot.js).

## Comandos disponíveis

### Administração

- `#ban @membro`
- `#adm @membro`
- `#sleep on`
- `#sleep off`
- `#tagall`
- `#bot`
- `#bot server`
- `#groupinfo`

### Usuário

- `#menu`
- `#regras`
- `#link`
- `#adms`
- `#figu`

## Módulos automáticos

### Boas-vindas

Quando um novo membro entra no grupo, o bot envia uma mensagem automática.

### Anti-link

O bot pode:

- apagar links proibidos
- remover membros por compartilhar links de grupo

As listas ficam em [src/config/links.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/links.js).

### Anti-flood

O bot remove membros comuns quando repetem a mesma mensagem muitas vezes em poucos segundos.

Configuração padrão:

- `10` mensagens repetidas
- dentro de `15` segundos

Ajuste em [src/config/antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiFlood.js).

## Figurinha

Para usar `#figu`:

1. responda uma imagem
2. envie `#figu`

O bot gera uma figurinha automaticamente.

## Reautenticar

Se a sessão quebrar:

1. pare o processo
2. apague a pasta `.wwebjs_auth`
3. rode `npm start`
4. escaneie o QR novamente

## Rodar em Ubuntu VPS

Fluxo básico:

1. instalar Node.js 20
2. instalar Chrome
3. rodar `npm install`
4. iniciar com `npm start`
5. manter online com `pm2`

Para detalhes técnicos, veja [doc/para desenvolvedores.md](C:/Users/LEO/Documents/PROJETOS/lara-bot/doc/para desenvolvedores.md).
