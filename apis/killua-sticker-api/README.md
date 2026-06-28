<p align="center">
  <img src="img/icon.jpg" alt="Killua Sticker API" width="140" />
</p>

<h1 align="center">killua-sticker-api</h1>

<p align="center">
  API local em Node.js para consumir packs de figurinhas em <code>.kpack</code>.
</p>

<p align="center">
  <a href="docs/uso-da-api.md">Uso da API</a> ·
  <a href="docs/criando-packs.md">Criação de Packs</a> ·
  <a href="https://leonelmiguins.github.io/killua-sticker-api/html/">Catálogo Web</a>
</p>

## Instalação

```bash
git clone https://github.com/LeonelMiguins/killua-sticker-api.git
cd killua-sticker-api
npm install
```

## Uso

```js
const stickers = require("./index");
```

Exemplo rápido:

```js
const stickers = require("./index");

async function main() {
  const packs = await stickers.getAllPacks();
  const pack = await stickers.getPack("animals.funnycats");

  console.log("packs:", packs.length);
  console.log("pack:", pack.name);
  console.log("primeira sticker:", pack.stickers[0].name);
}

main();
```

## Comandos disponíveis

### `getCategories()`

Retorna todas as categorias visíveis.

### `getAllPacks()`

Retorna todos os packs visíveis.

### `getPacksByCategory(category)`

Retorna os packs visíveis de uma categoria.

### `getPackInfo(packId)`

Retorna os metadados de um pack.

### `getPackManifest(packId)`

Retorna o manifesto interno do pack.

### `getPack(packId, options?)`

Retorna o pack completo com todas as stickers.

### `getSticker(packId, fileName, options?)`

Retorna uma figurinha específica.

### `hasPack(packId)`

Verifica se um pack está disponível.

### `findPacks(query)`

Busca packs por nome, categoria, descrição, id ou tags.

### `getRandomPack(category?)`

Retorna um pack aleatório.

### `getRandomSticker(packId, options?)`

Retorna uma figurinha aleatória de um pack.

### `getConfig()`

Retorna a configuração ativa da API.

### `reloadConfig()`

Recarrega `user/config.json` sem reiniciar a aplicação.

### `getAvailableCommands()`

Retorna a lista de comandos públicos disponíveis na API.

### `clearCache()`

Limpa os caches internos da API.

### `createStickerAPI({ packsDir, configPath })`

Cria uma instância isolada da API.

## Documentação

- API detalhada: [docs/uso-da-api.md](C:/Users/LEO/Documents/PROJETOS/killua-sticker-api/docs/uso-da-api.md)
- Guia de criação de packs: [docs/criando-packs.md](C:/Users/LEO/Documents/PROJETOS/killua-sticker-api/docs/criando-packs.md)
