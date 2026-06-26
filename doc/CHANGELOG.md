# Changelog

## 2.1.0 - 2026-06-26

- migração consolidada para `whatsapp-web.js`
- autenticação principal via QR Code com `LocalAuth`
- remoção do sistema de figurinha
- criação da camada `src/services/`
- configuração por grupo em `data/groups/`
- dados globais do dono em `data/system/`
- suporte a comandos do dono no privado com `--grupo <ID_DO_GRUPO>`
- notificações privadas do dono com `#notificacoes on|off`
- logs estruturados em `logs/bot.log`
- novos comandos de configuração:
  - `#boasvindas on|off`
  - `#antilink on|off`
  - `#antilink acao <categoria> <apagar|banir>`
  - `#blacklist`
  - `#antiflood on|off|limite|janela|minimo|reset`
  - `#regras add|del|reset`
- novos comandos operacionais:
  - `#statusgrupo`
  - `#grupos`
- módulos automáticos atuais:
  - `welcome`
  - `farewell`
  - `antiLink`
  - `antiFlood`
- atualização completa da documentação

## 2.0.0 - 2026-06-25

- refatoração inicial da base para uso como fundação de outros bots
- foco em administração de grupos, módulos automáticos e utilitários de usuário
