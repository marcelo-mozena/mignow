# Template Electron + React + Clean Architecture

![Electron](https://img.shields.io/badge/Electron-28.0-47848F?style=flat&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

Template moderno para aplicações Electron com React, TypeScript, shadcn/ui, seguindo princípios de Clean Architecture e CQRS.

## Documentação

- **[AI_GUIDELINES.md](AI_GUIDELINES.md)** - Diretrizes para desenvolvimento com IA
- **[AMBIENTE_REMOTO.md](AMBIENTE_REMOTO.md)** - Como executar em VS Code remoto/container

## Arquitetura

Segue os princípios de Clean Architecture com padrão CQRS (Command Query Responsibility Segregation) para manutenibilidade, controle de erros e escalabilidade.

### Estrutura do Projeto

```
template-electron/
├── electron/                    # Main Process (Electron)
│   ├── main.ts                 # Processo principal do Electron
│   ├── preload.ts              # Script de preload para IPC
│   └── ipc/                    # Handlers IPC
│       ├── commands/           # Handlers de comandos CQRS
│       └── queries/            # Handlers de queries CQRS
│
├── src/                        # Renderer Process (React)
│   ├── domain/                 # Regras de Negócio Empresariais
│   │   ├── entities/           # Entidades de domínio
│   │   ├── value-objects/      # Objetos de valor
│   │   └── interfaces/         # Interfaces de repositórios
│   │
│   ├── application/            # Regras de Negócio da Aplicação
│   │   ├── commands/           # Operações de escrita (CQRS)
│   │   ├── queries/            # Operações de leitura (CQRS)
│   │   ├── dto/                # Data Transfer Objects
│   │   └── events/             # Eventos de domínio
│   │
│   ├── infrastructure/         # Frameworks e Serviços Externos
│   │   ├── persistence/        # Implementação de repositórios
│   │   └── electron-api/       # Camada de comunicação IPC
│   │
│   ├── presentation/           # Camada de UI
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas
│   │   ├── hooks/              # Hooks customizados
│   │   └── providers/          # Provedores de contexto
│   │
│   ├── shared/                 # Recursos compartilhados
│   │   ├── errors/             # Tratamento de erros
│   │   ├── types/              # Tipos TypeScript
│   │   └── utils/              # Funções utilitárias
│   │
│   └── di/                     # Injeção de Dependência
│       └── container.ts        # Container IoC
```

## Características

- ✅ **Clean Architecture** - Separação clara de responsabilidades
- ✅ **CQRS** - Comandos e queries separados
- ✅ **Tratamento de Erros** - Sistema abrangente de erros
- ✅ **Injeção de Dependência** - InversifyJS para IoC
- ✅ **Type Safety** - TypeScript + Zod validation
- ✅ **UI Moderna** - shadcn/ui + Tailwind CSS
- ✅ **React Query** - Gerenciamento de estado e cache
- ✅ **Electron IPC** - Comunicação type-safe
- ✅ **Dev Container** - Ambiente de desenvolvimento remoto

## Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação Local

```bash
# Install dependencies
npm instar dependências
npm install
```

### Desenvolvimento Local

```bash
# Modo desenvolvimento
npm run electron:dev

# Apenas Vite dev server
npm run dev

# Build de produção
npm run build
```

### Desenvolvimento Remoto

Para desenvolvimento em container/remoto:

```bash
# 1. Instale Docker Desktop
# 2. Instale extensão Remote - Containers no VS Code
# 3. Pressione F1 → "Dev Containers: Reopen in Container"
```

Veja instruções completas em **[AMBIENTE_REMOTO.md](AMBIENTE_REMOTO.md)**

## Camadas da Arquitetura

### 1. Domain (Domínio)

Regras de negócio empresariais independentes de frameworks

- Entidades: User, Product
- Value Objects: Email, Money
- Interfaces de repositórios

### 2. Application (Aplicação)

Regras de negócio específicas da aplicação

- **Commands**: CreateUser, UpdateUser
- **Queries**: GetUser, ListUsers
- **DTOs**: UserDTO, ProductDTO
- **Events**: UserCreated, UserUpdated

### 3. Infrastructure (Infraestrutura)

Implementações de frameworks e serviços externos

- Repositórios in-memory
- Event Bus
- IPC Electron

### 4. Presentation (Apresentação)

Componentes de interface

- Componentes React com shadcn/ui
- Hooks customizados para CQRS
- Páginas e providers

## Padrão CQRS

### Comandos (Escrita)

```typescript
const command = new CreateUserCommand(email, name, role);
await commandBus.execute(command);
```

### Queries (Leitura)

```typescript
const query = new GetUserQuery(userId);
const result = await queryBus.execute(query);
```

## Stack Tecnológica

- **Electron 28** - Framework desktop
- **React 18** - Biblioteca UI
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **React Query** - Data fetching
- **InversifyJS** - Injeção de dependência
- **Zod** - Validação de schemas

## Componentes UI Incluídos

Button, Card, Input, Select, Dialog, Label, Skeleton, Alert, Toast

## Benefícios

1. **Manutenibilidade** - Separação clara de responsabilidades
2. **Testabilidade** - Cada camada pode ser testada independentemente
3. **Escalabilidade** - Organização por features
4. **Type Safety** - TypeScript completo
5. **Independência de Framework** - Lógica de negócio isolada

## Scripts Disponíveis

```bash
npm run dev              # Vite dev server
npm run electron:dev     # Electron + Vite com hot reload
npm run build           # Build de produção
npm run lint            # Executar ESLint
npm run preview         # Preview do build
```

## Desenvolvimento com IA

Este projeto inclui diretrizes para desenvolvimento assistido por IA. Consulte **[AI_GUIDELINES.md](AI_GUIDELINES.md)** para:

- Padrões de código
- Estrutura de arquivos
- Convenções de nomenclatura
- Melhores práticas CQRS
