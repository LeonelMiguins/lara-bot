# Criando Packs

Este guia é para quem vai montar ou manter os packs de stickers do projeto.

O fluxo oficial é:

1. colocar os arquivos-fonte em `packs_work`
2. definir os metadados do pack
3. rodar o build
4. gerar os `.kpack` em `packs`
5. atualizar o catálogo web
6. se precisar, extrair os `.kpack` de volta para `packs_work`

## Estrutura das pastas

Cada pack deve ficar dentro de uma categoria:

```text
packs_work/
  animals/
    funnycats/
      data.json
      sticker-1.webp
      sticker-2.png
      sticker-3.jpg
```

Formato esperado:

```text
packs_work/<categoria>/<slug-do-pack>/
```

Exemplo:

```text
packs_work/anime/killua1/
packs_work/memes/frog1/
packs_work/animals/funnycats/
```

## Formatos suportados

O build aceita estes arquivos de imagem:

- `.webp`
- `.png`
- `.jpg`
- `.jpeg`
- `.gif`
- `.apng`

O script converte tudo para `.webp` dentro do `.kpack`.

Se a imagem for animada, o build tenta preservar a animação no `.webp`.

## Manifesto do pack

Cada pasta deve conter um `data.json`.

Exemplo recomendado:

```json
{
  "schema": 1,
  "id": "animals.funnycats",
  "code": 788337,
  "name": "Funny Cats",
  "description": "Gatos engraçados com energia de meme e reação.",
  "author": "Leonel Miguins",
  "category": "animals",
  "cover": "sticker-fan_20262640_a.webp",
  "tags": ["animals", "cats", "funny", "reaction"]
}
```

## Campos do `data.json`

### Obrigatórios

- `schema`: versão do formato do manifesto
- `id`: identificador global do pack, normalmente `categoria.slug`
- `name`: nome amigável
- `category`: categoria do pack

### Recomendados

- `code`: código numérico do pack
- `description`: descrição curta
- `author`: autor do pack
- `cover`: nome do arquivo da capa
- `tags`: palavras-chave para busca

### Opcionais

- `adult`: use `true` para packs adultos

Exemplo com conteúdo adulto:

```json
{
  "schema": 1,
  "id": "+18.hentai-stickers",
  "code": 123456,
  "name": "Hentai Stickers",
  "description": "Pack adulto de anime.",
  "author": "Leonel Miguins",
  "category": "+18",
  "cover": "sticker-1.webp",
  "tags": ["anime", "adult", "nsfw"],
  "adult": true
}
```

## Regras práticas para organizar bem os packs

- Use `slug` curto e estável no nome da pasta.
- Evite espaços e acentos no nome da pasta do pack.
- Prefira nomes de arquivos previsíveis, como `1.webp`, `2.webp` ou `sticker_01.webp`.
- Defina `cover` apontando para uma imagem que realmente exista.
- Coloque apenas arquivos do pack dentro da pasta.

## Build dos packs

Depois de preparar `packs_work`, rode:

```bash
npm run build:kpacks
npm run build:catalog
```

Esse comando:

- escaneia todos os packs em `packs_work`
- converte imagens para `.webp`
- preserva animação quando possível
- copia os manifests ajustando a extensão da capa se necessário
- cria um `.kpack` por pack em `packs/<categoria>/`
- atualiza `html/catalog.json` e `html/covers/` para a vitrine web

## Extração reversa dos packs

Se você precisar reconstruir a pasta de trabalho a partir dos `.kpack` já gerados em `packs`, rode:

```bash
npm run extract:kpacks
```

Esse comando:

- lê todos os arquivos `.kpack` dentro de `packs/<categoria>/`
- recria a estrutura em `packs_work/<categoria>/<slug>/`
- extrai `data.json` e todas as imagens do pack
- recria cada pasta de pack do zero antes de extrair, para evitar mistura com arquivos antigos

Exemplo de resultado:

```text
packs/
  anime/
    killua1.kpack

packs_work/
  anime/
    killua1/
      data.json
      1.webp
      2.webp
```

## Saída final

Exemplo de resultado:

```text
packs/
  animals/
    funnycats.kpack
  anime/
    killua1.kpack
  memes/
    frog1.kpack
```

## Como o `.kpack` é montado

O `.kpack` é um `.zip` renomeado.

Dentro dele ficam:

- as imagens finais em `.webp`
- o `data.json`
- opcionalmente outros arquivos auxiliares que você decidiu manter

## Compatibilidade com a API

A API principal do projeto lê os `.kpack` de `packs`.

Então o fluxo correto é sempre:

1. editar ou adicionar packs em `packs_work`
2. rodar `npm run build:kpacks`
3. consumir os packs pela API local

Se você perder a pasta `packs_work`, pode reconstruí-la com `npm run extract:kpacks`.

## Cuidados ao atualizar packs

- Se você mudar imagens ou metadados em `packs_work`, rode o build de novo.
- A versão atual do build recompila todos os packs.
- Se sua aplicação já estiver aberta, chame `clearCache()` na API depois do rebuild.
- A extração trabalha na pasta `packs_work` singular, que é a pasta padrão usada pelo projeto.

## Checklist rápido

- a pasta está em `packs_work/<categoria>/<slug>`
- existe um `data.json`
- o `cover` aponta para um arquivo válido
- as imagens estão dentro da pasta do pack
- o build rodou sem erro
- o `.kpack` apareceu em `packs/<categoria>/`
