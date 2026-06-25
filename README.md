# TicketBoost

Extensão para Google Chrome que coleta mensagens do Digisac Web ou WhatsApp Web e gera um resumo com IA para abertura de chamados.

## O que a extensão faz

- Coleta mensagens da conversa aberta no navegador.
- Envia o conteúdo para o Gemini.
- Gera um resumo organizado para suporte.
- Permite copiar o resumo ou enviar para um formulário de chamado configurado.

## Requisitos

- Google Chrome.
- Uma API Key do Gemini: https://makersuite.google.com/app/apikey
- Acesso ao Digisac Web ou WhatsApp Web.

## Como instalar no Chrome

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Gere a versão da extensão:

   ```bash
   npm run build
   ```

3. Abra no Chrome:

   ```text
   chrome://extensions/
   ```

4. Ative o **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactação**.
6. Selecione a pasta raiz deste projeto.

Depois disso, o ícone da extensão aparecerá na barra do Chrome.

## Como usar

1. Abra uma conversa no **Digisac Web** ou **WhatsApp Web**.
2. Clique no ícone da extensão.
3. Informe sua API Key do Gemini, se solicitado.
4. Clique em **Coletar Mensagens**.
5. Clique em **Enviar para IA**.
6. Copie o resumo gerado ou use **Enviar para chamado**.

## Atualizar a extensão

Sempre que alterar o código:

```bash
npm run build
```

Depois, volte em `chrome://extensions/` e clique em **Atualizar** na extensão.

## Segurança

Não compartilhe sua API Key do Gemini e não publique ela no código do projeto.
