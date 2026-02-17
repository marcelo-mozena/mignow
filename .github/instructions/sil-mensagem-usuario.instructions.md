---
description: "Regras da SIL Sistemas para a criação de respostas de erro em APIs. Define o formato obrigatório e o conteúdo para error_message, display_message e error_code."
---

# Padrão de Resposta de Erro para APIs - SIL Sistemas

Este documento define o padrão **obrigatório** para todas as respostas de erro em APIs da SIL Sistemas. O objetivo é garantir segurança, consistência e clareza, separando a comunicação com o desenvolvedor (integrador) da comunicação com o usuário final.

## Estrutura de Resposta de Erro Obrigatória

Toda resposta de erro (status HTTP 4xx e 5xx) **DEVE** seguir exatamente esta estrutura JSON no corpo da resposta. Não adicione ou remova campos.

```json
{
  "error_code": "S000xxxx",
  "error_message": "Technical message for the developer.",
  "display_message": "Mensagem amigável para o usuário final."
}
```

---

## 1. `error_message`: Mensagem Técnica (para o Desenvolvedor)

Esta mensagem é um contrato com o desenvolvedor que consome a API. Seu único propósito é ajudá-lo a corrigir a requisição.

- **Idioma:** **SEMPRE** em Inglês.
- **Audiência:** Exclusivamente para o desenvolvedor (integrador).
- **Visibilidade:** **NUNCA** deve ser exibida na interface do usuário final.

### Regra Fundamental: A Causa do Erro Define a Mensagem

#### Cenário 1: Erro do Cliente (Status 4xx - Bad Request, Not Found, etc.)

Se o erro foi causado pelo consumidor da API, a mensagem **DEVE** ser específica e útil para que ele possa corrigir o problema.

**Exemplos (FAÇA ASSIM):**

- `"Missing 'Sil-Company' header."`
- `"The 'document' field must be a valid CPF or CNPJ."`
- `"Invalid date format for 'issue_date'. Use YYYY-MM-DD."`
- `"Route ID '123-abc' not found."`

#### Cenário 2: Erro Interno do Servidor (Status 5xx - Internal Server Error)

Se o erro foi uma falha interna nossa (banco de dados, serviço indisponível, exceção não tratada), a mensagem **DEVE SER GENÉRICA** para não expor nossa infraestrutura.

**Mensagens Padrão Permitidas (USE APENAS ESTAS):**

- `"Internal system error."`
- `"Service temporarily unavailable."`

### O que NUNCA incluir na `error_message`

Expor detalhes internos é uma falha de segurança. **NUNCA** inclua:

- Mensagens de exceção do sistema (`NullReferenceException`, `ArgumentNullException`, etc.).
- Stack traces.
- Consultas SQL ou erros de banco de dados (`ORA-02291`, `constraint violation`).
- Nomes de variáveis, métodos ou classes internas.
- Qualquer informação que revele a arquitetura, framework ou tecnologia utilizada.

**Diretriz de Depuração:** Detalhes completos do erro (exceções, stack traces) **DEVEM** ser registrados exclusivamente nos logs do servidor (console, arquivo, ferramenta de observabilidade). A API não é uma ferramenta de depuração interna.

## 2. `display_message`: Mensagem Amigável (para o Usuário Final)

Esta mensagem é o que o usuário final verá na tela. Deve ser clara, calma e útil.

- **Idioma:** **SEMPRE** em Português do Brasil (pt-BR).
- **Audiência:** Usuário final.
- **Linguagem:** Simples, sem jargões técnicos.
- **Tamanho:** Manter a mensagem concisa (sugestão: até 200 caracteres).

### Mensagens Padrão para Erros que o Usuário NÃO Pode Resolver

Se o problema é interno (Erro 5xx) ou o usuário não tem ação direta para corrigi-lo, use uma das mensagens padrão abaixo.

**Padrões Genéricos (USE ESTES):**

- `"Algo deu errado. Tente novamente mais tarde."`
- `"Estamos com instabilidade. Tente novamente em alguns minutos."`
- `"Serviço temporariamente indisponível. Tente novamente mais tarde."`
- `"Estamos em manutenção. Tente novamente em alguns minutos."`
- `"Algo deu errado. Tente novamente mais tarde. Se o problema persistir, contate o suporte."`

**Padrões com Contexto (USE ESTES, substituindo as chaves):**

- `"Não foi possível concluir {operação} agora. Tente novamente mais tarde."` (Ex: "Não foi possível concluir o agendamento agora.")
- `"Não foi possível carregar {recurso}. Tente novamente mais tarde."` (Ex: "Não foi possível carregar os seus pedidos.")
- `"Não foi possível salvar {recurso}. Tente novamente mais tarde."` (Ex: "Não foi possível salvar as alterações.")

## 3. Códigos (`error_code` e `response_status_code`)

- **`error_code`**: É gerado e gerenciado pelo sistema IMS. Ao criar um novo tratamento de erro, associe-o a um código existente ou solicite a criação de um novo. Ele é usado para referência e diagnóstico interno.
- **`response_status_code`**: Siga o padrão HTTP.
  - **4xx**: Erro do cliente (dados inválidos, falta de permissão, recurso não encontrado).
  - **5xx**: Erro do servidor (falha interna que nós precisamos corrigir).
