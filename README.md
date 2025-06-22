

<p align="center">
  <img src="./icons/ICON.jpg" alt="Lara Bot" width="200"/>
</p>

<h1 align="center">ＬＡＲＡ ＢＯＴ Ｖ１ ☘︎</h1>

<p align="center">
  Um bot moderno e rápido para <strong>WhatsApp</strong> com foco em administração e interação de membros em grupos usando a poderosa biblioteca <a href="https://github.com/WhiskeySockets/Baileys">@whiskeysockets/baileys</a>.<br>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-20.x-green" alt="Node.js">
  <img src="https://img.shields.io/badge/platform-WhatsApp-green">
  <img src="https://img.shields.io/badge/PM2-integrated-blue">
  <img src="https://img.shields.io/badge/status-active-brightgreen">
</p>


---

## 🚀 Recursos principais

- ✅ Boas-vindas automáticas personalizadas para novos membros
- ✅ Mensagens de despedida ao detectar a saída de um integrante
- ✅ Criação de figurinhas (stickers) a partir de imagens
- ✅ Comandos administrativos: banir, promover e muito mais
- ✅ Sistema anti-links inteligente: bloqueia links de grupos, sites adultos e casas de aposta
- ✅ Sistema de ranking com conquistas baseadas na participação nos grupos
- ✅ Lojinha interativa onde membros podem gastar moedas acumuladas em itens virtuais divertidos

---

## 🚀 Instalação

## Termux (Android)

### 1. Instale o Nodejs e o Git

```bash
pkg update && pkg upgrade -y
pkg install git nodejs -y
```
### 2. Clone o repositorio

```bash
git clone https://github.com/LeonelMiguins/lara-bot.git
cd lara-bot
```

### 3. Instalar as dependências do projeto

```bash
npm install
```
### 4. Rode o Bot

```bash
npm start
```

## Oracle VPS (Ubuntu/Debian)
É necessário ter uma conta gratuita na Oracle Cloud e uma instância VPS (máquina virtual) configurada com Ubuntu ou Debian.  
Crie sua conta aqui: [https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/)


### 1. Atualize o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instale o Git

```bash
sudo apt install -y git curl
```

### 3. Instalar Node.js 

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Clone o repositório do lara-bot

```bash
git clone https://github.com/LeonelMiguins/lara-bot.git
cd lara-bot
```
### 4. Instale dependências do sharp

```bash
sudo apt update
sudo apt install -y build-essential libvips-dev
```

### 4. Instale as dependências do projeto

```bash
npm install
```
### 7. Instale o PM2

Se você fechar o terminal ou perder a conexão SSH, o bot irá parar. Para mantê-lo sempre ativo como um serviço no Ubuntu, instale o PM2:

```bash
sudo npm install -g pm2
```

### 7. Inicie o bot com:

```bash
pm2 start npm --name lara-bot -- start
pm2 save
pm2 startup
```
---

## Uso

Envie o comando <b>#menu</b> para iniciar o bot.


## Créditos/Autores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/LeonelMiguins">
        <img src="https://github.com/LeonelMiguins.png" width="50px;" alt="Leonel Miguins"/>
        <br />
        <sub><b>Leonel Miguins</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/suspirinho7">
        <img src="https://github.com/suspirinho7.png" width="50px;" alt="Cipher"/>
        <br />
        <sub><b>Cipher</b></sub>
      </a>
    </td>
        <td align="center">
      <a href="https://github.com/IsaStwart">
        <img src="https://github.com/IsaStwart.png" width="50px;" alt="Cipher"/>
        <br />
        <sub><b>Isabella</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## Licença

### MIT Personalizada – Lara Bot

MIT Personalizada – Lara Bot  
Copyright (c) 2025 Leonel Miguins e colaboradores

Permissão é concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia deste software e dos arquivos de documentação associados *Lara-bot*, para usar, copiar, modificar, mesclar, publicar e distribuir o Software, **exclusivamente para fins pessoais ou educacionais**.

⚠️ É ESTRITAMENTE PROIBIDA a venda ou qualquer tipo de comercialização deste software, seja de forma direta ou indireta.

⚠️ É OBRIGATÓRIO manter os créditos originais ao autor principal e/ou ao repositório oficial:

- Nome: Leonel Miguins  
- GitHub: https://github.com/LeonelMiguins  

A remoção dos créditos ou qualquer tentativa de se apropriar da autoria original é terminantemente proibida.

O software é fornecido "no estado em que se encontra", sem garantia de qualquer tipo, expressa ou implícita. Em nenhuma circunstância os autores serão responsáveis por quaisquer danos decorrentes do uso deste software.

---

Desenvolvido com ❤️ para a comunidade.
