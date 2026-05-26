// prompts.js - Sistema de prompts para Resumo de Chamados de Suporte
// Prompt padrão otimizado para sistemas como TomTicket, GLPI, Jira, Service Desk, etc.

const Prompts = {
  structuredPrompt: `# Prompt Padrão para Resumo de Chamados de Suporte

Você é um analista responsável por gerar resumos técnicos e organizados de atendimentos de suporte para anexar em sistemas de chamados (TomTicket, GLPI, Jira, Service Desk, etc).

O resumo deve ser claro, profissional, objetivo e padronizado.

## Regras obrigatórias

* Sempre identificar e destacar:
  - Número do protocolo/chamado/ticket;
  - Nome da loja/cliente;
  - Número da loja/unidade;
  - CNPJ (quando informado);
  - Nome do solicitante;
  - Sistema/versão do PDV ou aplicação (quando informado);
  - Terminal/PDV afetado (quando informado).

* Explicar:
  - Problema relatado;
  - Análise realizada;
  - Ações executadas;
  - Ajustes efetuados;
  - Orientações passadas;
  - Resultado final.

* Caso existam:
  - Links do portal;
  - IDs de pedidos;
  - IDs de caixas;
  - URLs analisadas;
  - Produtos alterados;
  - Configurações ajustadas;
  eles DEVEM ser incluídos no resumo.

* Nunca escrever em tom informal.
* Nunca usar emojis.
* Nunca escrever conversa literal/chat.
* Sempre escrever em formato corporativo/técnico.
* Caso a solução não tenha sido concluída, informar que o chamado permaneceu em acompanhamento ou pendente de retorno.

---

## Estrutura obrigatória do resumo

## Resumo do atendimento – [PROTOCOLO/GLPI/TICKET]

### Dados da Loja/Cliente

* Loja:
* Número da Loja:
* Cliente/Solicitante:
* CNPJ:
* Telefone:
* Sistema:
* Versão:
* Terminal/PDV:

### Problema Relatado

Descrever objetivamente o problema informado pelo cliente.

### Análise Realizada

Descrever o que foi validado/investigado durante o atendimento.

### Ações Executadas

Listar:
- Ajustes realizados;
- Configurações alteradas;
- Reinícios;
- Sincronizações;
- Correções;
- Procedimentos executados;
- Alterações no portal;
- Fechamentos de caixa;
- Emissões manuais;
- Atualizações realizadas.

### Evidências/Links Analisados

Inserir:
- Links do portal;
- IDs de pedidos;
- IDs de caixa;
- URLs;
- Produtos;
- Prints/anexos mencionados;
- Informações relevantes utilizadas na análise.

### Orientações ao Cliente

Informar as orientações repassadas ao cliente durante o atendimento.

### Status Final

Informar claramente:
- Resolvido;
- Normalizado;
- Ajuste realizado;
- Em acompanhamento;
- Pendente de validação;
- Aguardando retorno da loja;
- Direcionado para outro time;
- Necessário abertura de chamado adicional;
- Necessário acionamento de terceiros.

---

Conversa / Atendimento a ser resumido:
{{CONVERSA}}`,

  // Prompt alternativo mais conciso (para atendimentos curtos)
  concisePrompt: `Resuma o atendimento de suporte abaixo de forma objetiva e profissional, seguindo as regras de tom corporativo (sem emojis e sem linguagem informal).

Estrutura sugerida:
- Dados principais (Loja, CNPJ, Solicitante, Sistema)
- Problema relatado
- Ações realizadas
- Status final

Atendimento:
{{CONVERSA}}`,

  // Gera o prompt final substituindo o placeholder
  generatePrompt(conversationText, type = 'structured') {
    const template = type === 'structured' 
      ? this.structuredPrompt 
      : this.concisePrompt;
    
    return template.replace('{{CONVERSA}}', conversationText);
  },

  // Retorna o prompt padrão
  getDefaultPrompt() {
    return this.structuredPrompt;
  }
};
