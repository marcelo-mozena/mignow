---
description: "Diretrizes para construir aplicações C#"
applyTo: "**/*.cs"
---

# Desenvolvimento em C#

## Instruções de C#

- Sempre use a versão mais recente do C#, atualmente os recursos do C# 13.
- Escreva comentários claros e concisos para cada função.

## Instruções Gerais

- Faça apenas sugestões de alta confiança ao revisar alterações de código.
- Escreva código com boas práticas de manutenção, incluindo comentários sobre por que certas decisões de design foram tomadas.
- Lide com casos extremos (edge cases) e escreva um tratamento de exceções claro.
- Para bibliotecas ou dependências externas, mencione seu uso e propósito nos comentários.
- Não duplicar código fonte

## Convenções de Nomenclatura

- Siga `PascalCase` para nomes de componentes, nomes de métodos e membros públicos.
- Use `camelCase` para campos privados e variáveis locais.
- Prefixe nomes de interface com "I" (ex., `IUserService`).
- Nomes de variáveis devem estar em inglês e ser descritivos do propósito da variável.

## Formatação

- Aplique o estilo de formatação de código definido no `.editorconfig`.
- Prefira declarações de `namespace` com escopo de arquivo e diretivas `using` de linha única. Exemplo:

```csharp
namespace xxxxxx.xxxxxxx.xxxxxxx;
public class Xxxxxxxxx : .....
{
  .....
}
```

- Insira uma nova linha antes da chave de abertura de qualquer bloco de código (ex., após `if`, `for`, `while`, `foreach`, `using`, `try`, etc.).
- Garanta que a instrução `return` final de um método esteja em sua própria linha.
- Use `pattern matching` e `switch expressions` sempre que possível.
- Use `nameof` em vez de literais de `string` ao se referir a nomes de membros.
- Garanta que comentários de documentação `XML` sejam criados para quaisquer APIs públicas. Quando aplicável, inclua documentação `<example>` e `<code>` nos comentários.

## Configuração e Estrutura do Projeto

- Oriente os usuários na criação de um novo projeto .NET com os `templates` apropriados.
- Explique o propósito de cada arquivo e pasta gerado para construir o entendimento da estrutura do projeto.
- Demonstre como organizar o código usando `feature folders` ou princípios de `domain-driven design`.
- Mostre a separação adequada de responsabilidades com `models`, `services` e `data access layers`.
- Explique o `Program.cs` e o sistema de configuração no ASP.NET Core 9, incluindo configurações específicas do ambiente.

## Nullable Reference Types

- Declare variáveis como não nulas (`non-nullable`) e verifique por `null` nos pontos de entrada.
- Sempre use `is null` ou `is not null` em vez de `== null` ou `!= null`.
- Confie nas anotações de nulo do C# e não adicione verificações de nulo quando o sistema de tipos diz que um valor não pode ser nulo.

## Padrões de Acesso a Dados

- Guie a implementação de uma camada de acesso a dados usando `Entity Framework Core`.
- Explique as diferentes opções (`postgres`,`In-Memory`) para desenvolvimento e produção.
- Demonstre a implementação do `repository pattern` e quando ele é benéfico.
- Mostre como implementar `database migrations` e `data seeding`.
- Explique padrões de `query` eficientes para evitar problemas comuns de desempenho.

## Validação e Tratamento de Erros

- Guie a implementação da validação de `model` usando `data annotations` e `FluentValidation`.
- Explique o `pipeline` de validação e como personalizar as respostas de validação.
- Demonstre uma estratégia global de tratamento de exceções usando `middleware`.
- Mostre como criar respostas de erro consistentes em toda a API.
- Explique a implementação de `problem details` (RFC 7807) para respostas de erro padronizadas.

## Versionamento e Documentação de API

- Oriente os usuários na implementação e explicação de estratégias de versionamento de API.
- Demonstre a implementação de `Swagger/OpenAPI` com a documentação adequada.
- Mostre como documentar `endpoints`, parâmetros, respostas e autenticação.
- Explique o versionamento em `controller-based` e `Minimal APIs`.
- Oriente os usuários sobre a criação de documentação de API significativa que ajude os consumidores.

## Logging e Monitoramento

- Guie a implementação de `structured logging` usando `Serilog` ou outros provedores.
- Explique os níveis de `logging` e quando usar cada um.
- Demonstre a integração com o `Application Insights` para coleta de telemetria.
- Mostre como implementar telemetria personalizada e `correlation IDs` para rastreamento de solicitações.
- Explique como monitorar o desempenho, os erros e os padrões de uso da API.

## Testes

- Sempre inclua casos de teste para os caminhos críticos da aplicação.
- Oriente os usuários na criação de testes de unidade.
- Não emita comentários "Act", "Arrange" ou "Assert".
- Copie o estilo existente em arquivos próximos para nomes de métodos de teste e capitalização.
- Explique abordagens de `integration testing` para `endpoints` de API.
- Demonstre como `mockar` dependências para testes eficazes.
- Mostre como testar a lógica de autenticação e autorização.
- Explique os princípios de `test-driven development` aplicados ao desenvolvimento de API.

## Performance Optimization

- Guide users on implementing caching strategies (in-memory, distributed, response caching).
- Explain asynchronous programming patterns and why they matter for API performance.
- Demonstrate pagination, filtering, and sorting for large data sets.
- Show how to implement compression and other performance optimizations.
- Explain how to measure and benchmark API performance.
