---
description: "Regras, padrões e melhores práticas para implementar o padrão CQRS (Command Query Responsibility Segregation) em .NET. Impõe arquitetura limpa, uso de MediatR e separação estrita de modelos."
applyTo: "**/*.cs"
---

# CQRS (Command Query Responsibility Segregation) para .NET

Este documento fornece diretrizes estritas para a implementação do padrão CQRS. O objetivo é garantir que todas as implementações de CQRS sejam escaláveis, de fácil manutenção e desacopladas.

## Princípios Fundamentais

- **Command:** Representa a intenção de alterar o estado do sistema (ex: criar, atualizar, deletar). Os `Commands` **DEVEM** ser nomeados com verbos no imperativo (ex: `CreateProductCommand`). Eles não devem retornar dados além de uma simples confirmação (ex: o ID da entidade criada ou `void`).
- **Query:** Representa uma solicitação de dados. As `Queries` **NÃO DEVEM** modificar o estado do sistema (ou seja, devem ser livres de efeitos colaterais - `side-effect free`). As `Queries` retornam dados, tipicamente na forma de um DTO.

## 1. Use MediatR para Desacoplamento

- Todos os `Commands` e `Queries` **DEVEM** ser implementados usando a biblioteca MediatR para desacoplar a solicitação de seu `handler`.
- Cada `Command` e `Query` **DEVE** ter sua própria classe de `handler` dedicada.

### Exemplo de Command Handler (FAÇA ISSO)

```csharp
// O Command: Um 'record' é preferível para imutabilidade.
public record CreateProductCommand(string Name, decimal Price) : IRequest<int>;

// O Handler: Implementa IRequestHandler.
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Price = request.Price
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}
```

### Exemplo de Query Handler (FAÇA ISSO)

```csharp
// A Query: Um 'record' é preferível para imutabilidade.
public record GetProductByIdQuery(int Id) : IRequest<ProductDto>;

// O Handler: Deve ser livre de efeitos colaterais (side-effect free).
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto>
{
    private readonly IReadDbContext _readContext; // Use um contexto otimizado para leitura separado, se disponível.

    public GetProductByIdQueryHandler(IReadDbContext readContext)
    {
        _readContext = readContext;
    }

    public async Task<ProductDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        // Projete diretamente para um DTO. Não recupere a entidade completa.
        var product = await _readContext.Products
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductDto { Id = p.Id, Name = p.Name }) // Projeção para DTO
            .FirstOrDefaultAsync(cancellationToken);

        return product;
    }
}
```

## 2. Separação Estrita de Modelos

- **NÃO** use o mesmo modelo para operações de leitura e escrita. Esta é a regra mais crítica do CQRS.
- **Lado da Escrita (Commands):** Use modelos de domínio ricos (`Entities`) que contêm lógica de negócios e regras de validação.
- **Lado da Leitura (Queries):** Use `Data Transfer Objects` (DTOs) ou `ViewModels` dedicados e simples. Esses modelos são contêineres de dados "burros", otimizados para o cliente.

## 3. Estrutura de Projeto e Arquivos

- Todos os `Commands`, `Queries` e suas classes relacionadas **DEVEM** ser organizados por `feature`. Agrupe todos os arquivos de uma única `feature` juntos.

### Estrutura Recomendada (Baseada em Feature)

```
/API
  /Controllers // client
  /ControllersServices
  /ControllersBackOffice
  /ControllersClientAdmin

/Application
  /Auth // quando necessário, definido a cada projeto
  /Requests
    /ToDoItems
      /DTOs
        - GetToDoDTO.cs
        - ToDoDTO.cs // se necessário
        - XxxxxxToDoDTO.cs
      /Insert
        - InsertToDoCommand.cs
        - InsertToDoCommandHandler.cs // Gravar log
        - InsertToDoValidator.cs // Somente se necessário
      /Update
      /Delete
      /Get // Lista
        - GetToDoQuery.cs
        - GetToDoQueryHandler.cs
      /GetById
      /GetXxxxxxxxxxxx
        - ToDoValidator.cs
  /Services
    /Application
      - ToDoService.cs
    /Security
    /Helper
    /xxxxxxxxxx

Domain
  /ToDoItems
    - ToDo.cs
    - IToDoRepository.cs
    /Queries
      - ToDoWithXxxxxxxxx.cs // Para situações em que não foi possível resolver com a entidade
  /Enums
    - ToDoEnums.cs

/Infra
    /Data
        - PgSqlConnectionFactory.cs
    /Helpers
        - Xxxxxxxx.cs
    /Repositories
        - ToDoRepository.cs // Tratar userId / OrgId / Data modificação diretamente na repository
        // criar pastas quando puder agrupar repositórios por área
```

## 4. Validação de Commands

- Todos os `Commands` que aceitam entrada **DEVEM** ser validados.
- Use a biblioteca **FluentValidation** para a lógica de validação.
- Os `Validators` **DEVEM** ser colocados junto com seu `Command` correspondente.
- A validação deve ser conectada ao `pipeline` do MediatR para ser executada automaticamente.

### Exemplo de Validator (FAÇA ISSO)

```csharp
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("O nome do produto é obrigatório.")
            .MaximumLength(200).WithMessage("O nome do produto não deve exceder 200 caracteres.");

        RuleFor(v => v.Price)
            .GreaterThan(0).WithMessage("O preço deve ser maior que zero.");
    }
}
```

## 5. Regras Críticas e Armadilhas Comuns

### Operações Assíncronas

- Todas as operações vinculadas a I/O (`I/O-bound`) dentro dos `handlers` (ex: acesso ao banco de dados) **DEVEM** ser assíncronas usando `async`/`await`.
- Sempre aceite e passe o `CancellationToken`.

### Efeitos Colaterais (Side-Effects)

- **NUNCA** modifique o estado dentro de um `handler` de `Query`. Isso inclui escritas no banco de dados, `logging` para um `outbox` transacional ou publicação de eventos. A única responsabilidade de uma `Query` é recuperar dados.
- **NÃO** chame um `Command` de um `handler` de `Query`, ou uma `Query` de um `handler` de `Command`.

### Quando Evitar CQRS

- **NÃO** aplique CQRS a aplicações CRUD simples. Ele adiciona complexidade desnecessária. Use-o apenas para domínios complexos ou onde as cargas de trabalho de leitura/escrita têm requisitos de desempenho e escalabilidade significativamente diferentes.

### Acesso a Dados

- **Queries:** Projete diretamente para um DTO usando `Select()`. **NÃO** busque entidades de domínio completas em `handlers` de `query` apenas para mapeá-las depois. Isso evita a recuperação de dados desnecessários e o potencial `overhead` de rastreamento do ORM.
- **Commands:** Carregue a entidade de domínio completa para que sua lógica de negócios possa ser executada antes de salvar as alterações.

# CQRS (Command Query Responsibility Segregation) for .NET

This document provides strict guidelines for implementing the CQRS pattern. The goal is to ensure all CQRS implementations are scalable, maintainable, and decoupled.

## Core Principles

- **Command:** Represents an intent to change the state of the system (e.g., create, update, delete). Commands **MUST** be named with imperative verbs (e.g., `CreateProductCommand`). They should not return data beyond a simple acknowledgment (e.g., the ID of the created entity or `void`).
- **Query:** Represents a request for data. Queries **MUST NOT** modify the state of the system (i.e., they must be side-effect free). Queries return data, typically in the form of a DTO.

## 1. Use MediatR for Decoupling

- All Commands and Queries **MUST** be implemented using the MediatR library to decouple the request from its handler.
- Every Command and Query **MUST** have its own dedicated handler class.

### Command Handler Example (DO THIS)

```csharp
// The Command: A record is preferred for immutability.
public record CreateProductCommand(string Name, decimal Price) : IRequest<int>;

// The Handler: Implements IRequestHandler.
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Price = request.Price
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}
```

### Query Handler Example (DO THIS)

```csharp
// The Query: A record is preferred for immutability.
public record GetProductByIdQuery(int Id) : IRequest<ProductDto>;

// The Handler: Must be side-effect free.
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto>
{
    private readonly IReadDbContext _readContext; // Use a separate read-optimized context if available.

    public GetProductByIdQueryHandler(IReadDbContext readContext)
    {
        _readContext = readContext;
    }

    public async Task<ProductDto> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        // Project directly to a DTO. Do not retrieve the full entity.
        var product = await _readContext.Products
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductDto { Id = p.Id, Name = p.Name }) // DTO projection
            .FirstOrDefaultAsync(cancellationToken);

        return product;
    }
}
```

## 2. Strict Model Separation

- **DO NOT** use the same model for both read and write operations. This is the most critical rule of CQRS.
- **Write Side (Commands):** Use rich domain models (Entities) that contain business logic and validation rules.
- **Read Side (Queries):** Use dedicated, simple Data Transfer Objects (DTOs) or ViewModels. These models are "dumb" data containers optimized for the client.

## 3. Project & File Structure

- All Commands, Queries, and their related classes **MUST** be organized by feature. Group all files for a single feature together.

### Recommended Structure (Feature-Based)

```
/Application
  /Features
    /Products
      /Commands
        /CreateProduct
          - CreateProductCommand.cs
          - CreateProductCommandHandler.cs
          - CreateProductCommandValidator.cs // FluentValidation validator
      /Queries
        /GetProductById
          - GetProductByIdQuery.cs
          - GetProductByIdQueryHandler.cs
          - ProductDto.cs
```

## 4. Command Validation

- All Commands that accept input **MUST** be validated.
- Use the **FluentValidation** library for validation logic.
- Validators **MUST** be placed alongside their corresponding Command.
- Validation should be hooked into the MediatR pipeline to run automatically.

### Example Validator (DO THIS)

```csharp
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.");

        RuleFor(v => v.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.");
    }
}
```

## 5. Critical Rules & Common Pitfalls

### Asynchronous Operations

- All I/O-bound operations within handlers (e.g., database access) **MUST** be asynchronous using `async`/`await`.
- Always accept and pass the `CancellationToken`.

### Side-Effects

- **NEVER** modify state within a Query handler. This includes database writes, logging to a transactional outbox, or publishing events. A Query's only responsibility is to retrieve data.
- **DO NOT** call a Command from a Query handler, or a Query from a Command handler.

### When to Avoid CQRS

- **DO NOT** apply CQRS to simple CRUD applications. It adds unnecessary complexity. Use it only for complex domains or where read/write workloads have significantly different performance and scaling requirements.

### Data Access

- **Queries:** Project directly to a DTO using `Select()`. **DO NOT** fetch full domain entities in query handlers only to map them later. This avoids unnecessary data retrieval and potential tracking overhead from the ORM.
- **Commands:** Load the full domain entity so its business logic can be executed before saving changes.
