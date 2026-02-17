---
description: "Padrão da Sil Sistemas para implementação de API."
---

# Instruções do GitHub Copilot para Endpoints de API

## 1. Design da API e Estrutura de Resposta (CRÍTICO)

Ao gerar `controllers`, `models` ou qualquer código relacionado à API, você DEVE aderir aos seguintes padrões.

### 1.1. Design de Endpoint

#### **Prefixos Raiz (Obrigatório)**

Todas as rotas de API DEVEM seguir um dos **prefixos raiz** padronizados abaixo. Esta regra substitui a orientação geral de iniciar todas as rotas com `/api/`.

| Prefixo Raiz    | Propósito                                                                                                                                                                                  |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/client`       | Endpoints usados por web clients ou aplicações frontend acessadas por usuários finais.                                                                                                     |
| `/client-admin` | Endpoints para gerenciamento da organização. Requer o header `SIL-ORGANIZATION`. Gerencia a Organização, suas Empresas e seus usuários.                                                    |
| `/internal`     | Endpoints usados exclusivamente para comunicação backend-to-backend dentro de nossa própria infraestrutura. Não expostos a clientes ou usuários finais.                                    |
| `/backoffice`   | Endpoints para uso interno exclusivo da equipe Sil Sistemas, destinados a funções administrativas, operacionais ou de monitoramento do sistema. Isso inclui endpoints de **health check**. |
| `/services`     | Endpoints acessados por contas de serviço, destinados a integrações de sistemas, automações e chamadas feitas sem interação direta de um usuário humano.                                   |
| `/webhook`      | Endpoints projetados para receber eventos e dados de sistemas externos.                                                                                                                    |

**Casos Especiais:** Casos de uso específicos com padrões de acesso distintos podem usar **prefixos personalizados**, desde que sejam **formalmente aprovados.**

- **Exemplo:** Para um Portal de Parceiros de Transporte, o prefixo `/portal-parceiros` pode ser usado para uma interface dedicada com regras de autenticação distintas.

#### **Regras Gerais de Endpoint**

- **Nomenclatura de Recursos**: Use substantivos no plural para recursos (ex: `/api/products`, `/api/users`).
- **Hierarquia**: Para recursos relacionados, use hierarquias de caminho claras (ex: `/api/users/{userId}/orders`).
- **Versionamento**:
  - **Breaking changes EXIGEM uma nova versão da API** (ex: de `/v1` para `/v2`). Breaking changes incluem:
    - Remover ou renomear campos em uma resposta.
    - Alterar o tipo de dado de um campo.
    - Adicionar novos campos obrigatórios a uma requisição.
    - Remover um endpoint ou um método HTTP suportado.
    - Alterar métodos de autenticação.
  - **Non-breaking changes NÃO exigem uma nova versão**. Estes incluem:
    - Adicionar novos endpoints.
    - Adicionar novos campos opcionais a uma resposta.
    - Adicionar novos parâmetros de query opcionais.

### 1.2. Estrutura do Corpo da Resposta

- **Formato**: O corpo de todas as respostas deve estar em formato JSON.
- **Nomenclatura de Campos**: Todos os campos no corpo JSON devem usar `snake_case`.
- **Respostas de Lista**: Para endpoints que retornam uma lista de itens, o array JSON deve ser envolvido por um objeto `"data"`.
  ```json
  {
    "data": [
      { "id": 1, "product_name": "Product A" },
      { "id": 2, "product_name": "Product B" }
    ]
  }
  ```

### 1.3. Tratamento de Erros

- **Estrutura de Resposta de Erro**: Todas as respostas de erro (status codes 4xx e 5xx) devem seguir esta estrutura JSON específica:
  ```json
  {
    "error_code": "S0000003",
    "error_message": "Uma mensagem técnica para o consumidor da API.",
    "display_message": "Uma mensagem amigável para o usuário."
  }
  ```
- **Conteúdo da Mensagem de Erro**:
  - O `error_message` é uma mensagem técnica para o consumidor da API. Deve ser descritivo para erros do lado do cliente (ex: `Header 'Sil-Company' ausente`) mas genérico para erros internos do servidor (ex: `Erro interno do sistema.`).
  - **NUNCA** exponha detalhes de implementação interna como stack traces ou queries SQL no `error_message`.
  - O `display_message` é uma mensagem opcional e amigável destinada ao usuário final.
- **Estratégia de Retentativa**: Para respostas `5xx` (Erro de Servidor) ou `429` (Muitas Requisições), espera-se que o cliente implemente uma estratégia de exponential backoff.

### 1.4. Códigos de Status HTTP

Use os códigos de status HTTP padrão corretamente:

- `200 OK`: Requisição GET bem-sucedida.
- `201 Created`: Requisição POST/PUT bem-sucedida que criou um novo recurso.
- `204 No Content`: Requisição DELETE/PUT bem-sucedida onde nenhum dado é retornado.
- `400 Bad Request`: Erro do lado do cliente (ex: JSON malformado).
- `401 Unauthorized`: Token de autenticação ausente ou inválido.
- `403 Forbidden`: Usuário autenticado não tem permissão.
- `404 Not Found`: O recurso solicitado não existe.

### 1.5. Endpoint de Health Check

- **Caminho**: O endpoint de health check está disponível em `/status/__health` ou `/backoffice/__health`.
- **Método**: `GET`.
- **Resposta**: Uma resposta bem-sucedida retorna `200 OK` com um corpo JSON contendo `status`, `version` e `timestamp`.
  ```json
  {
    "status": "ok",
    "version": "1.1.23",
    "timestamp": "2024-12-20T15:45:00.000Z"
  }
  ```

## 2. Headers e Autenticação

### 2.1. Headers de Tenant Obrigatórios

- **Regra**: Todas as requisições de API DEVEM incluir um header `Sil-Organization` ou `Sil-Company`. Um destes deve ser fornecido.
- **Comportamento**: Se nenhum dos headers for fornecido, a API deve rejeitar a requisição com um status code `400 Bad Request`.
- **Instrução**: Isso é crucial para nossa arquitetura multi-tenant. Ao gerar actions de `controller` ou `middleware`, sempre inclua a lógica de validação para a presença de um desses headers.

## 3. Formatação de Resposta para Análise e Sugestões

Quando for solicitado a analisar o código da API ou sugerir correções, você DEVE formatar sua resposta usando a seguinte estrutura. Agrupe todas as sugestões pelo caminho do endpoint correspondente e classifique-as por prioridade.

### Template para Formatação de Resposta

🔗 **Endpoint:** `[ex: GET /api/users/{id}]`

**Correções de Alta Prioridade:**

- (Lista de problemas críticos que violam nossos padrões de API, causam erros ou representam vulnerabilidades de segurança)

**Correções de Baixa Prioridade:**

- (Lista de sugestões para qualidade de código, estilo ou melhorias menores que não são críticas)

### Exemplo

🔗 **Endpoint:** `[ex: POST /api/products]`

**Correções de Alta Prioridade:**

- (Lista de problemas críticos)

**Correções de Baixa Prioridade:**

- (Lista de sugestões de melhorias)
