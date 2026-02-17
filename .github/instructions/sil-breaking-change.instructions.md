---
description: "Regras da SIL Sistemas para detecção de Breaking Changes para Serviços Backend C# .NET"
applyTo: "**/*.cs"
---

# Detecção de Breaking Changes para Serviços Backend C# .NET

Ao realizar code reviews, você DEVE identificar e sinalizar breaking changes de acordo com nossas diretrizes de versionamento de API.

## Breaking Changes Críticas a Detectar

Sinalize estas alterações com um aviso **🚨 BREAKING CHANGE** nos comentários do code review:

### 1. Alterações em Contratos de Response

- Remover ou renomear properties/fields em DTOs/models de response
- Alterar o tipo de dado de properties existentes (ex: `string` para `int`, `int` para `long`)
- Alterar a estrutura de objetos existentes (ex: promover um field para um objeto aninhado ou achatar objetos aninhados)
- Remover valores de enums usados em responses

### 2. Alterações em Request

- Adicionar novos parâmetros **obrigatórios** em request bodies ou query strings
- Adicionar novos parâmetros **obrigatórios** em routes
- Alterar tipos de parâmetros em request models
- Tornar parâmetros anteriormente opcionais em obrigatórios

### 3. Alterações em Endpoints

- Remover ou renomear endpoints/routes de controllers
- Remover HTTP methods de endpoints existentes (ex: remover `[HttpPatch]`)
- Alterar route templates

### 4. Alterações em Enums

- Remover valores de enums
- Renomear valores de enums (impacto na serialization)

## Non-Breaking Changes (Seguras - Não Precisam de Aviso)

Estas alterações são aceitáveis sem incremento de versão :

- Adicionar novas properties opcionais em responses
- Adicionar novos parâmetros opcionais em requests
- Adicionar novos endpoints ou HTTP methods
- Adicionar novos valores a enums (mas alertar consumers para tratar valores desconhecidos)
- Adicionar response body onde não existia anteriormente (ex: `204` para `200` com body)
- Reorganizar properties no JSON

## Formato do Code Review

Ao detectar uma breaking change, use este formato:

```
🚨 **BREAKING CHANGE DETECTADA**

**Tipo:** [Categoria da breaking change]
**Localização:** [Nome da Class/Method]
**Descrição:** [O que mudou]
**Impacto:** [Como isso afeta os consumers da API]
**Ação Necessária:** Esta alteração requer uma nova versão da API (ex: v1 → v2)

**Referência das Diretrizes:** De acordo com nossa política de versionamento de API, este tipo de alteração exige o incremento da versão para manter a retrocompatibilidade.
```

## Patterns Específicos de C# para Monitorar

### DTOs e Response Models

```csharp
// 🚨 BREAKING: Remover ou renomear properties
public class PedidoResponse
{
    // Se 'DataPedido' foi renomeado para 'CriadoEm' - SINALIZE ISSO
    // Se o tipo de 'Status' mudou de string para enum - SINALIZE ISSO
    // Se 'NomeCliente' foi removido - SINALIZE ISSO
}
```

### Controller Actions

```csharp
// 🚨 BREAKING: Adicionar parâmetros obrigatórios
[HttpGet("{id}")]
public async Task<Pedido> GetPedido(
    int id,
    [FromQuery][Required] string tenantId  // Se isso foi adicionado como OBRIGATÓRIO - SINALIZE ISSO
) { }
```

### Modificações em Enums

```csharp
// 🚨 BREAKING: Remover valores de enum
public enum StatusPedido
{
    Pendente,
    Processando,
    // Se 'Cancelado' foi removido - SINALIZE ISSO
    Concluido
}
```

## Checklist de Review

Ao revisar PRs de serviços backend, verifique:

- [ ] Nenhuma property removida de DTOs de response
- [ ] Nenhum tipo de property alterado em models existentes
- [ ] Nenhum parâmetro obrigatório adicionado a endpoints existentes
- [ ] Nenhum endpoint ou route removido/renomeado
- [ ] Nenhum valor de enum removido
- [ ] Se existem breaking changes, verificar se nova versão da API foi criada
