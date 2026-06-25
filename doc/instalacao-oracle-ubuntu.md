# Instalação na Oracle VPS (Ubuntu)

Guia prático para subir o Lara Bot Base em uma VPS Oracle Cloud com Ubuntu.

Este guia foi escrito pensando em:

- Oracle Cloud Free Tier
- Ubuntu
- `whatsapp-web.js`
- `LocalAuth`
- execução contínua com `pm2`

## Recomendação de infraestrutura

### Melhor opção no Free Tier

- shape: `VM.Standard.A1.Flex`
- sistema: `Ubuntu`
- OCPUs: `2`
- memória: `12 GB`

Observação:

- para `whatsapp-web.js`, essa é a melhor escolha no plano free por causa do Chrome/Puppeteer
- prefira **Ubuntu normal**, não `Ubuntu Minimal`, se estiver usando shape Arm/Ampere

### Opção mínima aceitável

- shape: `VM.Standard.E2.1.Micro`
- sistema: `Ubuntu`

Observação:

- funciona com mais aperto
- pode sofrer mais com memória por causa do Chrome

## 1. Criar a instância na Oracle

Na Oracle Cloud:

1. abra `Compute > Instances`
2. clique em `Create instance`
3. escolha um nome para a máquina
4. em `Image and shape`, escolha:
   - `Ubuntu`
   - de preferência `Ubuntu 22.04` ou `Ubuntu 24.04`
5. escolha a shape:
   - preferencialmente `VM.Standard.A1.Flex`
6. configure acesso SSH com sua chave pública
7. confirme a criação

## 2. Liberar acesso na rede

Garanta que as portas estejam corretas no Security List ou NSG:

- `22/TCP` para SSH

Se você não vai expor painel web, normalmente não precisa abrir mais nada.

## 3. Acessar por SSH

Exemplo:

```bash
ssh -i ~/.ssh/sua-chave.pem ubuntu@SEU_IP_PUBLICO
```

## 4. Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

## 5. Instalar utilitários básicos

```bash
sudo apt install -y git curl wget unzip ca-certificates gnupg
```

## 6. Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifique:

```bash
node -v
npm -v
```

## 7. Instalar Google Chrome e dependências do Puppeteer

Instale as bibliotecas necessárias:

```bash
sudo apt install -y \
  fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 libgbm1 libgcc-s1 \
  libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
  libxshmfence1 libxss1 libxtst6 lsb-release xdg-utils
```

Baixe e instale o Chrome:

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

Se estiver em Arm/Ampere e a imagem/ambiente não aceitar esse pacote específico, use o Chrome/Chromium compatível com a arquitetura disponibilizada no seu ambiente Ubuntu. O ponto importante é ter um navegador executável para o Puppeteer.

Verifique:

```bash
google-chrome --version
```

Se o binário estiver em outro caminho:

```bash
which google-chrome
which google-chrome-stable
which chromium-browser
which chromium
```

## 8. Clonar o projeto

```bash
git clone <SEU_REPOSITORIO> lara-bot
cd lara-bot
```

## 9. Instalar dependências do projeto

```bash
npm install
```

## 10. Validar a base

Antes de rodar:

```bash
npm run smoke
```

Isso confirma se os comandos carregam corretamente.

## 11. Ajustar configuração do bot

Arquivos mais importantes:

- [src/config/bot.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/bot.js)
- [src/config/features.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/features.js)
- [src/config/links.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/links.js)
- [src/config/antiFlood.js](/C:/Users/LEO/Documents/PROJETOS/lara-bot/src/config/antiFlood.js)

Se precisar apontar o Chrome manualmente:

```bash
export CHROME_BIN=/usr/bin/google-chrome
```

Ou:

```bash
export CHROME_BIN=/usr/bin/google-chrome-stable
```

## 12. Rodar o bot pela primeira vez

```bash
npm start
```

O esperado:

- o terminal mostra o QR Code
- você escaneia com o WhatsApp
- a sessão é salva em `.wwebjs_auth`

## 13. Persistência da sessão

Pastas importantes:

- `.wwebjs_auth`
- `.wwebjs_cache`

Não apague essas pastas se quiser manter a sessão.

Se quiser forçar novo login:

```bash
rm -rf .wwebjs_auth
```

Depois rode novamente:

```bash
npm start
```

## 14. Rodar em background com PM2

Instale:

```bash
sudo npm install -g pm2
```

Suba o processo:

```bash
pm2 start src/bot.js --name lara-bot
```

Salvar no boot:

```bash
pm2 save
pm2 startup
```

Ver status:

```bash
pm2 status
```

Ver logs:

```bash
pm2 logs lara-bot
```

Reiniciar:

```bash
pm2 restart lara-bot
```

Parar:

```bash
pm2 stop lara-bot
```

## 15. Variáveis de ambiente úteis

Se quiser, você pode iniciar assim:

```bash
CHROME_BIN=/usr/bin/google-chrome pm2 start src/bot.js --name lara-bot
```

Ou no shell atual:

```bash
export CHROME_BIN=/usr/bin/google-chrome
npm start
```

## 16. Troubleshooting

### O QR não aparece

Verifique:

- se o Chrome está instalado
- se o `CHROME_BIN` está correto
- se o bot conseguiu iniciar o navegador headless

Teste:

```bash
google-chrome --version
```

### Erro de biblioteca faltando no Chrome

Normalmente é dependência do sistema. Reinstale o bloco de bibliotecas do passo 7.

### O bot conecta e cai

Verifique:

- se a sessão em `.wwebjs_auth` corrompeu
- se o WhatsApp exigiu novo pareamento
- se o processo está reiniciando por falta de memória

### O bot consome muita RAM

Recomendações:

- usar uma única sessão por VPS
- evitar outras automações pesadas na mesma máquina
- preferir A1 com mais memória

### O comando admin diz que você não é admin

Verifique:

- se o bot já leu corretamente os participantes do grupo
- se o bot está no grupo como membro normal ou admin
- se você enviou o comando dentro do grupo correto

## 17. Dicas práticas

- use o bot com uma conta separada da sua conta pessoal principal
- mantenha backups das pastas de sessão se a operação for importante
- teste mudanças com `npm run smoke` antes de reiniciar em produção
- não deixe vários bots `whatsapp-web.js` brigando pelo mesmo número

## 18. Ordem recomendada de operação

1. criar VM Ubuntu
2. instalar Node 20
3. instalar Chrome
4. clonar projeto
5. rodar `npm install`
6. rodar `npm run smoke`
7. rodar `npm start`
8. escanear QR
9. subir com `pm2`
