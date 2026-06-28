# Instalação no Ubuntu

Este guia mostra como subir o `Lara Bot Base` em um servidor Ubuntu, com foco especial na parte do `Puppeteer` e do `Chromium/Chrome`, que costuma ser o ponto mais sensível em bots com `whatsapp-web.js`.

## Visão geral

O bot roda em:

- `Node.js`
- `whatsapp-web.js`
- `Puppeteer`
- um navegador compatível com Chromium

Na prática, o fluxo é:

1. instalar o Node.js
2. instalar as dependências do sistema
3. instalar as dependências do projeto com `npm install`
4. garantir que o `Puppeteer` consiga abrir um Chrome/Chromium
5. iniciar o bot e escanear o QR Code

---

## Requisitos recomendados

- Ubuntu `22.04` ou `24.04`
- `Node.js 20+`
- pelo menos `2 GB RAM`
- swap configurada ajuda bastante
- acesso SSH ao servidor

---

## 1. Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 2. Instalar Node.js 20

Use o NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique:

```bash
node -v
npm -v
```

---

## 3. Clonar ou enviar o projeto

Exemplo:

```bash
git clone <URL_DO_REPOSITORIO>
cd lara-bot
```

Se você já subiu os arquivos por outro meio, apenas entre na pasta do projeto.

---

## 4. Instalar dependências do sistema para Chromium

Essa é a parte mais importante.

Mesmo em modo `headless`, o `Puppeteer` precisa de várias bibliotecas do sistema para abrir o navegador. Sem isso, erros comuns aparecem:

- `Failed to launch the browser process`
- `error while loading shared libraries`
- `spawn ... ENOENT`
- Chrome abre e fecha na mesma hora

Instale:

```bash
sudo apt install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2t64 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libu2f-udev \
  libvulkan1 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  wget \
  xdg-utils
```

Se algum pacote variar conforme a versão do Ubuntu, instale o equivalente disponível no seu sistema.

---

## 5. Instalar dependências do projeto

```bash
npm install
```

Isso instala o bot e as dependências JavaScript.

---

## 6. Entendendo Puppeteer + Chromium

O projeto usa esta configuração:

- [`src/config/puppeteer.js`](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/puppeteer.js)

Hoje ela está assim:

- `headless: true`
- `executablePath: process.env.CHROME_BIN || undefined`
- flags como:
  - `--no-sandbox`
  - `--disable-setuid-sandbox`
  - `--disable-dev-shm-usage`
  - `--disable-gpu`

### O que isso significa

Se `CHROME_BIN` estiver definido:

- o bot tenta usar o navegador do sistema nesse caminho

Se `CHROME_BIN` não estiver definido:

- o Puppeteer tenta usar o navegador padrão disponível no ambiente dele

Na prática, você tem **2 caminhos bons** no Ubuntu.

---

## 7. Caminho A: usar Chrome/Chromium do sistema

Esse costuma ser o caminho mais previsível em servidor.

### Opção A1: Google Chrome Stable

Baixe e instale:

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

Verifique o caminho:

```bash
which google-chrome-stable
```

Normalmente:

```bash
/usr/bin/google-chrome-stable
```

Defina a variável:

```bash
export CHROME_BIN=/usr/bin/google-chrome-stable
```

Para persistir:

```bash
echo 'export CHROME_BIN=/usr/bin/google-chrome-stable' >> ~/.bashrc
source ~/.bashrc
```

### Opção A2: Chromium do sistema

Em alguns Ubuntus, o pacote `chromium-browser` pode vir via `snap`, o que às vezes complica ambiente de servidor ou automação.

Se você quiser tentar:

```bash
sudo apt install -y chromium-browser
which chromium-browser
```

Ou:

```bash
which chromium
```

Depois:

```bash
export CHROME_BIN=/usr/bin/chromium-browser
```

ou:

```bash
export CHROME_BIN=/usr/bin/chromium
```

### Recomendação prática

Se você quer menos dor de cabeça:

- prefira `Google Chrome Stable`

Porque no Ubuntu servidor o `Chromium` empacotado pode variar mais de comportamento.

---

## 8. Caminho B: deixar o Puppeteer usar o navegador dele

Esse caminho pode funcionar bem, mas depende mais do ambiente estar redondo.

Se você não definir `CHROME_BIN`, o Puppeteer tenta usar o navegador compatível dele.

Isso pode ser suficiente quando:

- o sistema tem as bibliotecas corretas
- a instalação do `npm install` ocorreu sem falhas

Se der erro de browser não encontrado, volte para o **Caminho A** e defina `CHROME_BIN`.

---

## 9. Testar se o navegador está disponível

Depois de configurar o `CHROME_BIN`, teste:

```bash
echo $CHROME_BIN
```

E:

```bash
$CHROME_BIN --version
```

Se isso responder corretamente, o caminho do navegador está bom.

---

## 10. Rodar o bot

```bash
npm start
```

Na primeira execução:

1. o terminal vai mostrar o painel de conexão
2. o QR Code vai aparecer no terminal
3. você escaneia com o WhatsApp
4. a sessão fica salva em:

```text
.wwebjs_auth/
```

Também são criadas:

```text
.wwebjs_cache/
data/groups/
data/system/
logs/
```

---

## 11. Se o QR não aparecer

Verifique:

1. se o bot conseguiu abrir o navegador
2. se as bibliotecas do sistema estão instaladas
3. se o `CHROME_BIN` aponta para um executável real
4. se não existe sessão antiga quebrada

Se precisar resetar a autenticação:

```bash
rm -rf .wwebjs_auth
```

Depois:

```bash
npm start
```

---

## 12. Erros comuns do Puppeteer

### `Failed to launch the browser process`

Causa comum:

- bibliotecas do sistema faltando
- navegador inexistente
- `CHROME_BIN` errado

O que fazer:

- reinstale as dependências do sistema
- teste `which google-chrome-stable`
- teste `$CHROME_BIN --version`

### `spawn ... ENOENT`

Causa comum:

- caminho do navegador inválido

O que fazer:

- confira `echo $CHROME_BIN`
- confira se o binário existe

### navegador fecha imediatamente

Causa comum:

- ambiente com pouca RAM
- sandbox do Chromium
- biblioteca faltando

O que fazer:

- manter as flags atuais do projeto
- garantir swap
- usar Chrome Stable

### bot consome muita RAM

Bots com `whatsapp-web.js` usam mais memória do que alternativas sem navegador.

O que ajuda:

- `headless: true`
- servidor com pelo menos `2 GB`
- swap ativa
- não abrir outros processos pesados no mesmo host

---

## 13. Rodar em segundo plano

Recomendado com `pm2`.

Instale:

```bash
sudo npm install -g pm2
```

Inicie:

```bash
pm2 start src/bot.js --name lara-bot
```

Se usar `CHROME_BIN`, inicie com a variável:

```bash
CHROME_BIN=/usr/bin/google-chrome-stable pm2 start src/bot.js --name lara-bot
```

Salvar estado:

```bash
pm2 save
pm2 startup
```

Ver logs:

```bash
pm2 logs lara-bot
```

---

## 14. Configuração útil para servidor

Arquivo:

- [`src/config/bot.js`](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/bot.js)

Defina corretamente:

- `botName`
- `prefix`
- `owner.name`
- `owner.phone`

O número do dono deve estar em formato completo, preferencialmente:

```js
phone: '5545991073900'
```

---

## 15. Checklist final

Antes de concluir, confirme:

- `node -v` mostra `20+`
- `npm install` terminou sem erro
- as bibliotecas do Chromium estão instaladas
- `CHROME_BIN` está correto, se você optou por usar navegador do sistema
- `npm start` mostra o painel de conexão
- o QR aparece no terminal
- após escanear, o bot mostra o número conectado

---

## 16. Recomendação final

Para Ubuntu servidor, meu caminho mais seguro para essa base é:

1. Ubuntu `22.04` ou `24.04`
2. Node `20`
3. instalar as libs do sistema
4. instalar `Google Chrome Stable`
5. definir:

```bash
export CHROME_BIN=/usr/bin/google-chrome-stable
```

6. rodar com `pm2`

Esse é, em geral, o setup mais estável para `whatsapp-web.js` em Linux.
