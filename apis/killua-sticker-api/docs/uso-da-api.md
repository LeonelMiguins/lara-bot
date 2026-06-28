# Uso da API

Este projeto expõe uma API local em Node.js para ler os arquivos `.kpack` da pasta `packs` e usar os stickers em bots de WhatsApp, sites e automações.

## Instalação

Clone o projeto ou copie a pasta para dentro da sua aplicação:

```bash
git clone https://github.com/LeonelMiguins/killua-sticker-api.git
```

Instale as dependências:

```bash
npm install
```

## Importação

Você pode importar pelo arquivo principal do projeto:

```js
const stickers = require("./index");
```

Ou importar diretamente da API:

```js
const stickers = require("./api");
```

## Configuração de uso

A API lê por padrão o arquivo:

```text
user/config.json
```

Exemplo:

```json
{
  "filters": {
    "allowAdult": false,
    "blockedCategories": [],
    "blockedPackIds": []
  }
}
```

### Campos disponíveis

- `filters.allowAdult`: quando `false`, bloqueia packs `adult: true` e packs da categoria `+18`
- `filters.blockedCategories`: bloqueia categorias inteiras
- `filters.blockedPackIds`: bloqueia packs específicos por `id`

Depois de editar esse arquivo com a aplicação já aberta, recarregue:

```js
stickers.reloadConfig();
```

## Formatos de identificação de pack

As funções aceitam estes formatos:

```js
"animals.funnycats"
"animals/funnycats"
{ category: "animals", slug: "funnycats" }
```

## Funções disponíveis

### `getAllPacks()`

Retorna a lista de todos os packs disponíveis.

```js
const packs = await stickers.getAllPacks();
console.log(packs.length);
console.log(packs[0]);
```

Retorno aproximado:

```js
{
  id: "animals.funnycats",
  slug: "funnycats",
  category: "animals",
  name: "Funny Cats",
  description: "Gatos engraçados com energia de meme e reação.",
  author: "Leonel Miguins",
  tags: ["animals", "cats", "funny", "reaction"],
  cover: "sticker-fan_20262640_a.webp",
  code: 788337,
  adult: false,
  fileName: "funnycats.kpack",
  fileSize: 3689625,
  kpackPath: "C:/.../packs/animals/funnycats.kpack",
  updatedAt: "2026-06-22T12:00:00.000Z"
}
```

### `getCategories()`

Retorna todas as categorias encontradas em `packs`.

```js
const categories = await stickers.getCategories();
console.log(categories);
```

### `getPacksByCategory(category)`

Retorna apenas os packs de uma categoria.

```js
const memes = await stickers.getPacksByCategory("memes");
```

### `getPackInfo(packId)`

Retorna apenas os metadados do pack, sem carregar as imagens.

```js
const info = await stickers.getPackInfo("anime.killua1");
console.log(info.name);
console.log(info.cover);
```

### `getPackManifest(packId)`

Retorna o `data.json` ou `pack-info.json` interno do `.kpack`.

```js
const manifest = await stickers.getPackManifest("anime.killua1");
console.log(manifest);
```

### `getPack(packId, options?)`

Retorna os metadados do pack mais todas as imagens do pacote.

```js
const pack = await stickers.getPack("animals.funnycats");
console.log(pack.name);
console.log(pack.stickers.length);
console.log(pack.stickers[0]);
```

Cada sticker vem assim por padrão:

```js
{
  name: "sticker-fan_20262640_a.webp",
  path: "sticker-fan_20262640_a.webp",
  mimeType: "image/webp",
  size: 459540,
  index: 0,
  buffer: <Buffer ...>
}
```

### `getPack(packId, { encoding: "base64" })`

Se você quiser trafegar em JSON ou HTTP, pode pedir base64:

```js
const pack = await stickers.getPack("animals.funnycats", {
  encoding: "base64"
});

console.log(pack.stickers[0].data);
```

### `getSticker(packId, fileName, options?)`

Retorna apenas uma sticker específica de um pack.

```js
const sticker = await stickers.getSticker(
  "animals.funnycats",
  "sticker-fan_20262640_a.webp"
);

console.log(sticker.mimeType);
console.log(sticker.buffer);
```

Também aceita o formato com categoria e slug separados:

```js
const sticker = await stickers.getSticker(
  "animals",
  "funnycats",
  "sticker-fan_20262640_a.webp"
);
```

### `hasPack(packId)`

Verifica se um pack existe.

```js
const exists = await stickers.hasPack("anime.killua1");
```

### `findPacks(query)`

Busca packs por nome, categoria, descrição, id ou tags.

```js
const results = await stickers.findPacks("killua");
```

### `getRandomPack(category?)`

Retorna um pack aleatório.

```js
const anyPack = await stickers.getRandomPack();
const memePack = await stickers.getRandomPack("memes");
```

### `getRandomSticker(packId, options?)`

Retorna uma figurinha aleatória de um pack.

```js
const sticker = await stickers.getRandomSticker("memes.frog1");
```

### `clearCache()`

Limpa o cache interno dos `.kpack` já lidos.

Use isso quando você rebuildar os packs durante a execução da aplicação.

```js
stickers.clearCache();
```

### `getConfig()`

Retorna a configuração ativa lida de `user/config.json`.

```js
const config = stickers.getConfig();
console.log(config);
```

### `reloadConfig()`

Recarrega o arquivo de configuração sem reiniciar a aplicação.

```js
stickers.reloadConfig();
```

### `getAvailableCommands()`

Retorna a lista de comandos públicos disponíveis na API.

```js
const commands = stickers.getAvailableCommands();
console.log(commands);
```

Exemplo de retorno:

```js
[
  {
    name: "getPack",
    signature: "getPack(packId, options?)",
    description: "Retorna o pack com todas as stickers."
  }
]
```

### `createStickerAPI({ packsDir })`

Cria uma instância isolada da API apontando para outra pasta.

```js
const { createStickerAPI } = require("./index");

const api = createStickerAPI({
  packsDir: "/meus/packs"
});
```

## Exemplo com bot de WhatsApp

Exemplo genérico para qualquer biblioteca que aceite `Buffer`:

```js
const stickers = require("./index");

async function enviarPack(conn, jid, packId) {
  const pack = await stickers.getPack(packId);

  for (const item of pack.stickers) {
    await conn.sendMessage(jid, {
      sticker: item.buffer
    });
  }
}
```

Exemplo enviando uma figurinha aleatória:

```js
const stickers = require("./index");

async function enviarAleatoria(conn, jid) {
  const pack = await stickers.getRandomPack("memes");
  const sticker = await stickers.getRandomSticker(pack.id);

  await conn.sendMessage(jid, {
    sticker: sticker.buffer
  });
}
```

## Observações importantes

- A API lê os `.kpack` diretamente da pasta `packs`.
- O método `getPack()` carrega todas as imagens do pack em memória.
- Para catálogos ou listagens, prefira `getAllPacks()` e `getPackInfo()`.
- Depois de rodar um novo build com `npm run build:kpacks`, chame `clearCache()` se sua aplicação já estiver aberta.
- Se `allowAdult` estiver `false`, packs `+18` deixam de aparecer em `getAllPacks()`, `findPacks()`, `getRandomPack()` e outras consultas públicas.
