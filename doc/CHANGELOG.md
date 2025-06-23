# 📦 CHANGELOG – ＬＡＲＡ ＢＯＴ Ｖ１ ☘︎

Registro de mudanças e melhorias do projeto **ＬＡＲＡ ＢＯＴ Ｖ１ ☘︎**.

---

## 🔖 Versão 1.1.1 – V1 (23/06/2025)

###  Novidades

- **Nova implementação de figurinhas**  
  A antiga dependência `sharp` foi removida e substituída por `cwebp-bin`, uma biblioteca mais leve, compatível com Baileys e ideal para criação de figurinhas no WhatsApp sem dependências nativas. Isso facilita o uso em varios ambientes (Ubuntu/Debian, Windows e no Termux).

- **Suporte a prefixo dinâmico**  
  Agora é possível personalizar o prefixo dos comandos do bot. Basta configurar no arquivo de `config`.


###  Melhorias Visuais

-  **Lojinha reformulada**  
  Itens da loja ganharam nomes mais divertidos e emojis descritivos. Exemplo:

- Mensagens do bot foram **padronizadas**, tornando a resposta mais clara e coesa, facilitando a leitura em grupos.


###  Mudanças Técnicas

- 📦 Atualizado o `package.json` com a nova dependência:
  ```json
  "sharp": "^1.4.4"
  ```
