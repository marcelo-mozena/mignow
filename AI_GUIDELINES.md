# AI Guidelines for Electron React Clean Architecture Project

> **Purpose**: This document provides comprehensive guidelines for AI assistants working with this codebase. It explains the architecture, patterns, and best practices to maintain consistency and quality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer Responsibilities](#layer-responsibilities)
3. [CQRS Pattern](#cqrs-pattern)
4. [DRY — Don't Repeat Yourself](#dry--dont-repeat-yourself)
5. [Adding New Features](#adding-new-features)
6. [Error Handling](#error-handling)
7. [State Management](#state-management)
8. [Electron + Next.js Boundary](#electron--nextjs-boundary)
9. [Naming Conventions](#naming-conventions)
10. [File Organization](#file-organization)
11. [Common Patterns](#common-patterns)
12. [Logging & Observability](#logging--observability)
13. [Security](#security)
14. [Internationalization (i18n)](#internationalization-i18n)
15. [Testing Strategy](#testing-strategy)
16. [Dependencies & Tooling](#dependencies--tooling)
17. [Best Practices](#best-practices)
18. [Known Technical Debt](#known-technical-debt)

---

## Architecture Overview

This project follows **Clean Architecture** principles with **CQRS** (Command Query Responsibility Segregation) pattern. The dependency rule is strictly enforced: **dependencies point inward** toward business logic.

### Dependency Flow

```
Presentation Layer → Infrastructure Layer → Application Layer → Domain Layer
     (UI)          (Repositories, IPC)    (Use Cases)      (Entities)
```

### Key Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Inversion**: Depend on abstractions, not concretions
3. **Framework Independence**: Business logic doesn't depend on frameworks
4. **Testability**: Each layer can be tested in isolation
5. **CQRS**: Separate read and write operations
6. **DRY (Don't Repeat Yourself)**: Eliminate duplication of logic, data, and patterns
7. **Strict Layer Boundaries**: Inner layers MUST NOT depend on outer layers (e.g., `infrastructure/` must never import from `presentation/`)

---

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)

**Purpose**: Contains enterprise business rules and core domain logic.

**What belongs here**:

- ✅ Domain entities (User, Product)
- ✅ Value objects (Email, Money)
- ✅ Repository interfaces (IUserRepository)
- ✅ Domain events definitions
- ✅ Business rules and validations

**What doesn't belong here**:

- ❌ Framework-specific code
- ❌ Database implementations
- ❌ HTTP requests
- ❌ UI components
- ❌ External dependencies

**Example Entity Structure**:

```typescript
// src/domain/entities/User.ts
export class User {
  private constructor(private props: UserProps) {}

  // Getters only - immutable from outside
  get id(): string {
    return this.props.id;
  }

  // Business logic methods
  public updateName(name: string): void {
    // Validation logic here
    this.props.name = name;
  }

  // Factory methods
  public static create(props: Omit<UserProps, "id">): User {
    return new User({ ...props, id: crypto.randomUUID() });
  }
}
```

### 2. Application Layer (`src/application/`)

**Purpose**: Contains application-specific business rules (use cases).

**What belongs here**:

- ✅ Command handlers (write operations)
- ✅ Query handlers (read operations)
- ✅ DTOs (Data Transfer Objects)
- ✅ Domain event handlers
- ✅ Application services
- ✅ Validation schemas (Zod)

**Structure**:

```
application/
├── commands/           # Write operations
│   └── CreateUser/
│       ├── CreateUserCommand.ts
│       └── CreateUserHandler.ts
├── queries/            # Read operations
│   └── GetUser/
│       ├── GetUserQuery.ts
│       └── GetUserHandler.ts
├── dto/               # Data Transfer Objects
│   └── UserDTO.ts
└── events/            # Domain event handlers
    └── UserCreatedEvent.ts
```

**Command Handler Pattern**:

```typescript
export class CreateUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private eventBus: IEventBus,
  ) {}

  async handle(command: CreateUserCommand): Promise<Result<User>> {
    try {
      // 1. Validate input
      const validated = createUserSchema.parse(command);

      // 2. Business logic
      const user = User.create(validated);

      // 3. Persist
      const result = await this.userRepository.save(user);
      if (result.isFailure) return result;

      // 4. Emit events
      await this.eventBus.publish(new UserCreatedEvent(user));

      return Result.ok(user);
    } catch (error) {
      return Result.fail(new ValidationError("Validation failed"));
    }
  }
}
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Contains implementations of external services and frameworks.

**What belongs here**:

- ✅ Repository implementations
- ✅ Database adapters
- ✅ External API clients
- ✅ IPC communication layer
- ✅ File system operations
- ✅ Third-party integrations

**Repository Implementation Pattern**:

```typescript
export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<Result<User>> {
    try {
      this.users.set(user.id, user);
      return Result.ok(user);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

### 4. Presentation Layer (`src/presentation/`)

**Purpose**: Contains UI components and presentation logic.

**What belongs here**:

- ✅ React components
- ✅ Custom hooks
- ✅ Context providers
- ✅ View models
- ✅ UI-specific logic

**Structure**:

```
presentation/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── features/        # Feature-specific components
│   │   └── users/
│   └── shared/          # Shared components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── providers/           # Context providers
└── view-models/         # Presentation logic
```

---

## CQRS Pattern

### Commands (Write Operations)

Commands change the state of the system.

**Checklist for adding a new command**:

1. ✅ Create command class in `application/commands/[CommandName]/`
2. ✅ Create command handler with validation
3. ✅ Use Zod schema for validation
4. ✅ Return `Result<T>` type
5. ✅ Emit domain events after successful execution
6. ✅ Register handler in DI container
7. ✅ Register IPC handler in `electron/ipc/commands/`

**Template**:

```typescript
// 1. Command
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}

// 2. Handler
export class CreateUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private eventBus: IEventBus,
  ) {}

  async handle(command: CreateUserCommand): Promise<Result<User>> {
    // Implementation
  }
}

// 3. Register in container.ts
container
  .bind<CreateUserHandler>("CreateUserHandler")
  .toDynamicValue((context) => {
    const userRepository =
      context.container.get<IUserRepository>("UserRepository");
    const eventBus = context.container.get<IEventBus>("EventBus");
    return new CreateUserHandler(userRepository, eventBus);
  });

// 4. Register IPC handler
ipcMain.handle("command:createUser", async (_, command) => {
  const handler = container.get<CreateUserHandler>("CreateUserHandler");
  const result = await handler.handle(command);
  if (result.isFailure) throw result.error;
  return result.value;
});
```

### Queries (Read Operations)

Queries retrieve data without modifying state.

**Checklist for adding a new query**:

1. ✅ Create query class in `application/queries/[QueryName]/`
2. ✅ Create query handler
3. ✅ Return DTO, not domain entities
4. ✅ Use `Result<T>` type
5. ✅ Register handler in DI container
6. ✅ Register IPC handler in `electron/ipc/queries/`

**Template**:

```typescript
// 1. Query
export class GetUserQuery {
  constructor(public readonly userId: string) {}
}

// 2. Handler
export class GetUserHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserQuery): Promise<Result<UserDTO>> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      return Result.fail(new NotFoundError("User not found"));
    }
    return Result.ok(UserDTO.fromEntity(user));
  }
}
```

---

## DRY — Don't Repeat Yourself

**DRY** is a core principle in this codebase. Every piece of knowledge or logic should have a **single, authoritative representation**. Duplication leads to inconsistency, increased maintenance cost, and bugs.

### Rules

1. **No duplicated business logic**: If a validation, calculation, or transformation exists, extract it to the appropriate layer and reuse it
2. **No duplicated types/interfaces**: Define types once in the appropriate layer. Use re-exports from barrel files when needed across layers
3. **No copy-paste handlers**: When CQRS handlers share common patterns (e.g., validation → execute → persist → emit event), extract a base handler or helper function
4. **No duplicated utility functions**: All shared utilities go in `src/shared/utils/`. Check before creating a new util that an equivalent doesn't already exist
5. **No duplicated error handling**: Use a unified error hierarchy. Don't create separate error classes per layer that represent the same concept
6. **Prefer abstractions over repetition**: If the same boilerplate appears 3+ times, extract a generic helper, factory, or higher-order function

### DI Container Registration — Avoid Repetitive Patterns

```typescript
// ❌ Bad — Repetitive manual resolution
container.bind<CreateUserHandler>('CreateUserHandler').toDynamicValue((ctx) => {
  const repo = ctx.container.get<IUserRepository>('UserRepository');
  const bus = ctx.container.get<IEventBus>('EventBus');
  return new CreateUserHandler(repo, bus);
});
container.bind<UpdateUserHandler>('UpdateUserHandler').toDynamicValue((ctx) => {
  const repo = ctx.container.get<IUserRepository>('UserRepository');
  const bus = ctx.container.get<IEventBus>('EventBus');
  return new UpdateUserHandler(repo, bus);
});

// ✅ Good — Extract a factory helper
function bindCommandHandler<T>(
  container: Container,
  token: string,
  Handler: new (repo: IUserRepository, bus: IEventBus) => T,
) {
  container.bind<T>(token).toDynamicValue((ctx) => {
    const repo = ctx.container.get<IUserRepository>('UserRepository');
    const bus = ctx.container.get<IEventBus>('EventBus');
    return new Handler(repo, bus);
  });
}

bindCommandHandler(container, 'CreateUserHandler', CreateUserHandler);
bindCommandHandler(container, 'UpdateUserHandler', UpdateUserHandler);
```

### React Hooks — Extract Shared Mutation Logic

```typescript
// ❌ Bad — Duplicated mutation pattern in every hook
export const useCreateUser = () => {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => commandBus.execute(new CreateUserCommand(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => commandBus.execute(new UpdateUserCommand(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

// ✅ Good — Extract a command mutation factory
function useCommandMutation<TInput, TCommand>(
  CommandClass: new (input: TInput) => TCommand,
  invalidateKey: string[],
) {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => commandBus.execute(new CommandClass(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invalidateKey }),
  });
}

export const useCreateUser = () => useCommandMutation(CreateUserCommand, ['users']);
export const useUpdateUser = () => useCommandMutation(UpdateUserCommand, ['users']);
```

### Common DRY Violations to Avoid

| Violation | Solution |
|-----------|----------|
| Multiple files defining the same TypeScript type | Define once in `shared/types/`, re-export via barrel |
| Same API error parsing in multiple services | Centralize in `apiClient.ts` error interceptor |
| Repeated Zod schemas with overlapping fields | Use `z.object().extend()` or `z.intersection()` |
| Duplicated toast/notification patterns | Extract `showSuccessToast()`, `showErrorToast()` helpers |
| Same date/string formatting across components | Use `shared/utils/date.ts` and `shared/utils/string.ts` |

---

## Adding New Features

### Step-by-Step Process

#### 1. Define Domain Entity (if needed)

```typescript
// src/domain/entities/Product.ts
export class Product {
  private constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }

  public updateName(name: string): void {
    this.props.name = name;
  }

  public static create(props: Omit<ProductProps, "id">): Product {
    return new Product({ ...props, id: crypto.randomUUID() });
  }
}
```

#### 2. Define Repository Interface

```typescript
// src/domain/interfaces/repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<Result<Product>>;
  update(product: Product): Promise<Result<Product>>;
  delete(id: string): Promise<Result<void>>;
}
```

#### 3. Implement Repository

```typescript
// src/infrastructure/persistence/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  // ... other methods
}
```

#### 4. Create Commands and Queries

```typescript
// src/application/commands/CreateProduct/CreateProductCommand.ts
export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly price: number,
  ) {}
}

// src/application/commands/CreateProduct/CreateProductHandler.ts
export class CreateProductHandler {
  constructor(
    private productRepository: IProductRepository,
    private eventBus: IEventBus,
  ) {}

  async handle(command: CreateProductCommand): Promise<Result<Product>> {
    // Implementation with validation
  }
}
```

#### 5. Register in DI Container

```typescript
// src/di/container.ts
container
  .bind<IProductRepository>("ProductRepository")
  .to(ProductRepository)
  .inSingletonScope();

container
  .bind<CreateProductHandler>("CreateProductHandler")
  .toDynamicValue((context) => {
    const productRepository =
      context.container.get<IProductRepository>("ProductRepository");
    const eventBus = context.container.get<IEventBus>("EventBus");
    return new CreateProductHandler(productRepository, eventBus);
  });
```

#### 6. Register IPC Handlers

```typescript
// electron/ipc/commands/index.ts
ipcMain.handle("command:createProduct", async (_, command) => {
  const handler = container.get<CreateProductHandler>("CreateProductHandler");
  const result = await handler.handle(command);
  if (result.isFailure) throw result.error;
  return result.value;
});
```

#### 7. Create React Hooks

```typescript
// src/presentation/hooks/useCreateProduct.ts
export const useCreateProduct = () => {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const command = new CreateProductCommand(input.name, input.price);
      return await commandBus.execute(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
```

#### 8. Create UI Components

```typescript
// src/presentation/components/features/products/ProductList.tsx
export const ProductList: React.FC = () => {
  const { data, isLoading, error } = useProducts();

  // Component implementation
};
```

---

## Error Handling

### Error Hierarchy

```
AppError (base)
├── ValidationError (400)
├── NotFoundError (404)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── ConflictError (409)
├── InternalError (500)
├── QueryError (500)
└── CommandError (500)
```

### Using Result Pattern

**Always use `Result<T>` for operations that can fail**:

```typescript
// ✅ Good
async save(user: User): Promise<Result<User>> {
  try {
    this.users.set(user.id, user);
    return Result.ok(user);
  } catch (error) {
    return Result.fail(error as Error);
  }
}

// ❌ Bad - throwing errors directly
async save(user: User): Promise<User> {
  this.users.set(user.id, user);
  return user;
}
```

### Handling Validation Errors

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

async handle(command: CreateUserCommand): Promise<Result<User>> {
  try {
    const validated = schema.parse(command);
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Result.fail(new ValidationError('Validation failed', error.errors));
    }
    throw error;
  }
}
```

### Error Handling in React

```typescript
// Use React Error Boundary at app level
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Handle errors in mutations
const createUser = useCreateUser();

const handleSubmit = async () => {
  try {
    await createUser.mutateAsync(input);
    toast.success('User created');
  } catch (error: any) {
    toast.error(error.message);
  }
};
```

---

## State Management

This project uses a **custom lightweight store system** based on React's `useSyncExternalStore`. Understanding when to use each state mechanism is critical.

### Store Architecture

The store factory is in `src/presentation/stores/createStore.ts`:

```typescript
// Creates a store with subscribe, getSnapshot, setState, reset
const store = createStore<AuthState>(initialState);
```

### When to Use Each State Mechanism

| Mechanism | Use Case | Example |
|-----------|----------|---------|
| **Custom Store** (`createStore`) | Global app state that needs to be accessed outside React components (auth, org, request logs) | `useAuthStore`, `useOrgStore` |
| **React Query** (`@tanstack/react-query`) | Server state — cached API data with automatic refetch, invalidation | Fetching lists, entity details from API |
| **React `useState`/`useReducer`** | Component-local UI state (form inputs, toggles, modals) | Form dialogs, dropdown open/close |
| **React Context** | Dependency injection for providers (CQRS buses, theme) | `CQRSProvider` |

### Rules

1. **Do NOT use custom stores for server-cached data** — use React Query for API data
2. **Do NOT put API calls directly in store actions** — stores hold state, services call APIs
3. **Export standalone setter functions** for stores that need to be updated from non-React code (e.g., `setOrgsFromJwt()`)
4. **Never import store from infrastructure layer** — pass values via function parameters or shared config

---

## Electron + Next.js Boundary

This is a hybrid Electron + Next.js application. **Respecting the boundary between Electron (main process) and the renderer (Next.js) is critical.**

### Architecture

```
┌─────────────────────────────────────────┐
│ Electron Main Process (electron/)       │
│   ├── main.ts (window management)       │
│   ├── preload.ts (context bridge)       │
│   └── ipc/ (command/query handlers)     │
├─────────────────────────────────────────┤
│         IPC Bridge (contextBridge)      │
├─────────────────────────────────────────┤
│ Renderer Process (src/)                 │
│   ├── app/ (Next.js routing)            │
│   ├── presentation/ (UI & hooks)        │
│   ├── infrastructure/ (API, adapters)   │
│   ├── application/ (CQRS handlers)      │
│   └── domain/ (entities, interfaces)    │
└─────────────────────────────────────────┘
```

### Rules

1. **Electron main process code** lives exclusively in `electron/`
2. **Renderer cannot directly access** Node.js APIs — use `preload.ts` + `contextBridge`
3. **IPC handlers** in `electron/ipc/` follow the same command/query pattern as the application layer
4. **Types shared between main and renderer** go in `src/infrastructure/electron-api/types.d.ts`
5. **Never import Electron modules** in `src/` — use the bridge abstraction in `infrastructure/electron-api/`

---

## Logging & Observability

### Rules

1. **Never log sensitive data** — Bearer tokens, passwords, full request headers with auth, PII
2. **Use conditional logging** — wrap verbose logs in environment checks:

```typescript
// ✅ Good
if (process.env.NODE_ENV === 'development') {
  console.group(`[API] ${method} ${url}`);
  console.log('Status:', response.status);
  console.groupEnd();
}

// ❌ Bad — logs tokens in production
console.log('Headers:', headers); // includes Authorization: Bearer xxx
```

3. **Structured log format** — prefer objects over string concatenation:

```typescript
// ✅ Good
console.info({ event: 'import_complete', entity: 'veiculos', count: 150 });

// ❌ Bad
console.log('Import of veiculos done, 150 records');
```

4. **Request logging** uses the pluggable `setRequestLogger()` pattern in `apiClient.ts` to avoid cross-layer dependencies. New logging mechanisms should use this same pattern.

---

## Security

### Rules

1. **Never hardcode** secrets, tokens, API keys, or credentials in source code
2. **Environment variables** for configuration only (URLs, feature flags) — never for business logic
3. **Validate all inputs** — use Zod schemas at API boundaries and command handlers
4. **Sanitize error responses** — never expose stack traces, SQL queries, or internal method names to the client
5. **Token storage** — tokens are stored in memory (stores), never in `localStorage` or cookies without proper security flags
6. **Header validation** — all tenant/org headers (`Sil-Organization`, `Sil-Company`) must be validated server-side

### API Client Security

```typescript
// ❌ Bad — logging full auth headers
console.log('Request headers:', headers);

// ✅ Good — redact sensitive values
const safeHeaders = { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined };
console.log('Request headers:', safeHeaders);
```

---

## Internationalization (i18n)

### Rules

1. **User-facing messages** (UI text, toast notifications, error display messages) MUST be in **Portuguese (pt-BR)**
2. **Technical messages** (log entries, `error_message` in API responses, code comments for complex logic) are in **English**
3. **Variable names, function names, class names** MUST be in **English**
4. **Date/time formatting** MUST use `pt-BR` locale:

```typescript
// ✅ Good
new Date().toLocaleDateString('pt-BR');
new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);

// ❌ Bad — English locale for user-facing dates
new Date().toLocaleDateString('en-US');
```

5. **Currency formatting** uses BRL:

```typescript
new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
```

6. **Do NOT mix languages** in the same context. If an error class returns messages to the UI, all its messages must be pt-BR. If it returns messages for developers, all must be English.

---

## Naming Conventions

### Files and Folders

- **PascalCase**: Classes, Components, Entities
  - `User.ts`, `UserRepository.ts`, `CreateUserCommand.ts`
- **camelCase**: Hooks, utilities, instances
  - `useUser.ts`, `formatDate.ts`
- **kebab-case**: Folders (optional, for features)
  - `user-management/`

### Classes and Interfaces

```typescript
// Commands: [Verb][Entity]Command
CreateUserCommand;
UpdateUserCommand;
DeleteUserCommand;

// Queries: [Action][Entity]Query
GetUserQuery;
ListUsersQuery;
FindUserByEmailQuery;

// Handlers: [Command/Query Name]Handler
CreateUserHandler;
GetUserHandler;

// Repositories: [Entity]Repository
UserRepository;
ProductRepository;

// Interfaces: I[Name]
IUserRepository;
IEventBus;

// DTOs: [Entity]DTO
UserDTO;
ProductDTO;

// Events: [Entity][Action]Event
UserCreatedEvent;
UserUpdatedEvent;
```

### Variables and Functions

```typescript
// ✅ Good
const userId = "123";
const userRepository = new UserRepository();
const isUserActive = true;
const getUserById = (id: string) => {};

// ❌ Bad
const user_id = "123";
const UserRepo = new UserRepository();
const active = true;
const get_user = (id: string) => {};
```

---

## File Organization

### Feature-Based Organization

When a feature grows, organize by feature:

```
application/
└── features/
    ├── user-management/
    │   ├── commands/
    │   ├── queries/
    │   ├── dto/
    │   └── events/
    └── product-catalog/
        ├── commands/
        ├── queries/
        ├── dto/
        └── events/
```

### Component Organization

```
presentation/components/features/
├── users/
│   ├── UserList.tsx
│   ├── UserCard.tsx
│   ├── CreateUserDialog.tsx
│   └── EditUserDialog.tsx
└── products/
    ├── ProductList.tsx
    ├── ProductCard.tsx
    └── CreateProductDialog.tsx
```

---

## Common Patterns

### 1. DTOs Always Transform at Boundaries

```typescript
// ✅ Good - Return DTO from handler
async handle(query: GetUserQuery): Promise<Result<UserDTO>> {
  const user = await this.userRepository.findById(query.userId);
  return Result.ok(UserDTO.fromEntity(user));
}

// ❌ Bad - Return domain entity
async handle(query: GetUserQuery): Promise<Result<User>> {
  const user = await this.userRepository.findById(query.userId);
  return Result.ok(user);
}
```

### 2. Repository Methods Return Result

```typescript
// ✅ Good
async save(user: User): Promise<Result<User>> {
  try {
    // Implementation
    return Result.ok(user);
  } catch (error) {
    return Result.fail(error as Error);
  }
}
```

### 3. Validation in Handlers

```typescript
// ✅ Good - Validate in handler
async handle(command: CreateUserCommand): Promise<Result<User>> {
  const validated = createUserSchema.parse(command);
  // Continue with validated data
}

// ❌ Bad - No validation
async handle(command: CreateUserCommand): Promise<Result<User>> {
  // Directly use command without validation
}
```

### 4. Event-Driven Communication

```typescript
// After successful operation, emit events
const result = await this.userRepository.save(user);
if (result.isSuccess) {
  await this.eventBus.publish(new UserCreatedEvent(user));
}
```

### 5. React Hooks for CQRS

```typescript
// Commands
const createUser = useCreateUser();
const updateUser = useUpdateUser();

// Queries
const { data: user } = useUser(userId);
const { data: users } = useUsers({ page: 1, limit: 10 });
```

---

## Testing Strategy

> ⚠️ **Current state**: Test infrastructure is not yet set up. When implementing, use **Vitest** as test runner and **React Testing Library** for components.

### Recommended Setup

```
devDependencies:
  vitest
  @testing-library/react
  @testing-library/jest-dom
  @testing-library/user-event
  msw (for API mocking)
```

### Test File Placement

Co-locate tests with source files:

```
src/domain/entities/
  User.ts
  User.test.ts         # Unit test for entity
src/application/commands/CreateUser/
  CreateUserHandler.ts
  CreateUserHandler.test.ts  # Unit test for handler
src/presentation/hooks/
  useCreateUser.ts
  useCreateUser.test.ts      # Hook test
```

### Unit Tests

Test each layer independently:

```typescript
// Domain Entity Test
describe("User", () => {
  it("should create a user with valid data", () => {
    const user = User.create({ email: "test@example.com", name: "Test" });
    expect(user.email).toBe("test@example.com");
  });
});

// Handler Test
describe("CreateUserHandler", () => {
  it("should create user successfully", async () => {
    const mockRepo = new MockUserRepository();
    const handler = new CreateUserHandler(mockRepo, mockEventBus);

    const command = new CreateUserCommand(
      "test@example.com",
      "Test",
      UserRole.USER,
    );
    const result = await handler.handle(command);

    expect(result.isSuccess).toBe(true);
  });
});
```

### Integration Tests

Test layer interactions:

```typescript
describe("User Management Integration", () => {
  it("should create and retrieve user", async () => {
    // Create user
    const createCommand = new CreateUserCommand(
      "test@example.com",
      "Test",
      UserRole.USER,
    );
    const createResult = await commandBus.execute(createCommand);

    // Retrieve user
    const getQuery = new GetUserQuery(createResult.value.id);
    const getResult = await queryBus.execute(getQuery);

    expect(getResult.value.email).toBe("test@example.com");
  });
});
```

### Test Naming Convention

Use descriptive names following the pattern: `should [expected behavior] when [condition]`

```typescript
// ✅ Good
it("should return failure when email is invalid")
it("should emit UserCreatedEvent after successful creation")
it("should invalidate users query cache on mutation success")

// ❌ Bad
it("test1")
it("works")
it("creates user")
```

### What to Test (Priority Order)

1. **Domain entities**: Business rules, validation logic, factory methods
2. **Command/Query handlers**: Input validation, orchestration, error paths
3. **Custom hooks**: State transitions, side effects
4. **Utility functions**: Edge cases, formatting, parsing
5. **UI components**: User interactions, conditional rendering

---

## Dependencies & Tooling

### Core Dependencies

| Package | Purpose | Layer |
|---------|---------|-------|
| `next` | App framework / routing | Presentation |
| `react` / `react-dom` | UI rendering | Presentation |
| `@tanstack/react-query` | Server state / cache management | Presentation |
| `inversify` + `reflect-metadata` | Dependency Injection container | Infrastructure/DI |
| `zod` | Schema validation | Application |
| `sonner` | Toast notifications | Presentation |
| `tailwindcss` | Utility-first CSS | Presentation |
| `jszip` + `file-saver` | Template download/export | Infrastructure |
| `jose` | JWT decoding | Shared utils |

### Rules for Adding Dependencies

1. **Check if the need is already covered** by an existing dependency before adding a new one (DRY)
2. **Prefer small, focused libraries** over large frameworks
3. **Document the purpose** of new dependencies in this table
4. **Never add dependencies that duplicate** functionality already in the project (e.g., don't add `axios` when `apiClient.ts` wraps `fetch`)
5. **Use Symbol-based DI tokens** instead of string literals when registering in inversify:

```typescript
// ✅ Good
export const TOKENS = {
  UserRepository: Symbol.for('UserRepository'),
  EventBus: Symbol.for('EventBus'),
} as const;

container.bind<IUserRepository>(TOKENS.UserRepository).to(UserRepository);

// ❌ Bad — fragile string tokens
container.bind<IUserRepository>('UserRepository').to(UserRepository);
```

---

## Best Practices

### ✅ Do's

1. **Always use Result pattern** for operations that can fail
2. **Validate input** using Zod schemas in handlers
3. **Return DTOs** from queries, not domain entities
4. **Emit domain events** after successful operations
5. **Keep entities immutable** from outside (use getters and methods)
6. **Use dependency injection** for all dependencies
7. **Follow SOLID principles**
8. **Write descriptive error messages**
9. **Use TypeScript strictly** (no `any` types)
10. **Keep handlers focused** (single responsibility)
11. **Apply DRY** — extract repeated patterns into helpers, factories, and shared utilities
12. **Respect layer boundaries** — never import from outer layers into inner layers

### ❌ Don'ts

1. **Don't bypass layers** (e.g., UI → Repository directly)
2. **Don't put business logic in UI components**
3. **Don't return domain entities** from queries
4. **Don't use concrete classes** in domain interfaces
5. **Don't throw errors** without using Result pattern
6. **Don't skip validation** in command handlers
7. **Don't create circular dependencies**
8. **Don't mix concerns** (e.g., UI logic in handlers)
9. **Don't use `any` type** — use `unknown` + type narrowing instead
10. **Don't modify entities** directly from outside
11. **Don't import from presentation/ in infrastructure/** — this violates Clean Architecture
12. **Don't duplicate logic** — always check if a util/helper/pattern already exists
13. **Don't log sensitive data** (tokens, passwords, PII) in any environment
14. **Don't copy-paste code** — if you're copying a block, extract it into a shared function

---

## Quick Reference Checklist

### Adding a New Feature

- [ ] Define domain entity (if needed)
- [ ] Create repository interface in domain layer
- [ ] Implement repository in infrastructure layer
- [ ] Create command with handler and validation
- [ ] Create query with handler
- [ ] Create DTO for data transfer
- [ ] Register in DI container
- [ ] Register IPC handlers in Electron
- [ ] Create React hooks
- [ ] Create UI components
- [ ] Add error handling
- [ ] Write tests
- [ ] Update documentation

### Code Review Checklist

- [ ] Follows Clean Architecture principles
- [ ] Dependencies point inward
- [ ] Uses Result pattern for error handling
- [ ] Validation with Zod schemas
- [ ] Returns DTOs, not entities
- [ ] Registered in DI container
- [ ] IPC handlers registered
- [ ] Error handling implemented
- [ ] TypeScript types defined
- [ ] No circular dependencies
- [ ] Tests written
- [ ] Documentation updated

---

## Example: Complete Feature Implementation

Here's a complete example of adding a "Product" feature:

### 1. Domain Entity

```typescript
// src/domain/entities/Product.ts
export interface ProductProps {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class Product {
  private constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get price(): number {
    return this.props.price;
  }
  get stock(): number {
    return this.props.stock;
  }

  public updatePrice(price: number): void {
    if (price < 0) throw new Error("Price cannot be negative");
    this.props.price = price;
  }

  public addStock(quantity: number): void {
    this.props.stock += quantity;
  }

  public static create(props: Omit<ProductProps, "id">): Product {
    return new Product({ ...props, id: crypto.randomUUID() });
  }
}
```

### 2. Repository Interface

```typescript
// src/domain/interfaces/repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<Result<Product>>;
  update(product: Product): Promise<Result<Product>>;
}
```

### 3. Repository Implementation

```typescript
// src/infrastructure/persistence/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async save(product: Product): Promise<Result<Product>> {
    try {
      this.products.set(product.id, product);
      return Result.ok(product);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(product: Product): Promise<Result<Product>> {
    try {
      if (!this.products.has(product.id)) {
        return Result.fail(new NotFoundError("Product not found"));
      }
      this.products.set(product.id, product);
      return Result.ok(product);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
```

### 4. Command and Handler

```typescript
// src/application/commands/CreateProduct/CreateProductCommand.ts
export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}
}

// src/application/commands/CreateProduct/CreateProductHandler.ts
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  stock: z.number().nonnegative(),
});

export class CreateProductHandler {
  constructor(
    private productRepository: IProductRepository,
    private eventBus: IEventBus,
  ) {}

  async handle(command: CreateProductCommand): Promise<Result<Product>> {
    try {
      const validated = createProductSchema.parse(command);

      const product = Product.create({
        name: validated.name,
        price: validated.price,
        stock: validated.stock,
      });

      const result = await this.productRepository.save(product);
      if (result.isFailure) return result;

      await this.eventBus.publish(new ProductCreatedEvent(product));

      return Result.ok(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail(
          new ValidationError("Validation failed", error.errors),
        );
      }
      throw error;
    }
  }
}
```

### 5. Query and Handler

```typescript
// src/application/queries/GetProduct/GetProductQuery.ts
export class GetProductQuery {
  constructor(public readonly productId: string) {}
}

// src/application/queries/GetProduct/GetProductHandler.ts
export class GetProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async handle(query: GetProductQuery): Promise<Result<ProductDTO>> {
    const product = await this.productRepository.findById(query.productId);

    if (!product) {
      return Result.fail(new NotFoundError("Product not found"));
    }

    return Result.ok(ProductDTO.fromEntity(product));
  }
}
```

### 6. DTO

```typescript
// src/application/dto/ProductDTO.ts
export class ProductDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}

  public static fromEntity(product: Product): ProductDTO {
    return new ProductDTO(
      product.id,
      product.name,
      product.price,
      product.stock,
    );
  }
}
```

### 7. DI Registration

```typescript
// src/di/container.ts
container
  .bind<IProductRepository>("ProductRepository")
  .to(ProductRepository)
  .inSingletonScope();

container
  .bind<CreateProductHandler>("CreateProductHandler")
  .toDynamicValue((context) => {
    const productRepository =
      context.container.get<IProductRepository>("ProductRepository");
    const eventBus = context.container.get<IEventBus>("EventBus");
    return new CreateProductHandler(productRepository, eventBus);
  });

container
  .bind<GetProductHandler>("GetProductHandler")
  .toDynamicValue((context) => {
    const productRepository =
      context.container.get<IProductRepository>("ProductRepository");
    return new GetProductHandler(productRepository);
  });
```

### 8. IPC Registration

```typescript
// electron/ipc/commands/index.ts
ipcMain.handle("command:createProduct", async (_, command) => {
  const handler = container.get<CreateProductHandler>("CreateProductHandler");
  const result = await handler.handle(command);
  if (result.isFailure) throw result.error;
  return result.value;
});

// electron/ipc/queries/index.ts
ipcMain.handle("query:getProduct", async (_, query) => {
  const handler = container.get<GetProductHandler>("GetProductHandler");
  const result = await handler.handle(query);
  if (result.isFailure) throw result.error;
  return result.value;
});
```

### 9. React Hooks

```typescript
// src/presentation/hooks/useCreateProduct.ts
export const useCreateProduct = () => {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const command = new CreateProductCommand(
        input.name,
        input.price,
        input.stock,
      );
      return await commandBus.execute(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// src/presentation/hooks/useProduct.ts
export const useProduct = (productId: string) => {
  const queryBus = useQueryBus();

  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const result = await queryBus.execute<{ value: ProductDTO }>(
        new GetProductQuery(productId),
      );
      return result.value;
    },
    enabled: !!productId,
  });
};
```

### 10. UI Components

```typescript
// src/presentation/components/features/products/CreateProductDialog.tsx
export const CreateProductDialog: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const { toast } = useToast();
  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({ name, price, stock });
      toast({ title: 'Success', description: 'Product created' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog>
      {/* Dialog implementation */}
    </Dialog>
  );
};
```

---

## Conclusion

This architecture provides:

- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features
- **Testability**: Each layer can be tested independently
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error management
- **Framework Independence**: Business logic is framework-agnostic

When working with this codebase, always:

1. Follow the dependency rule (inward dependencies)
2. Use CQRS pattern for all operations
3. Implement Result pattern for error handling
4. Keep layers separated and focused
5. Apply DRY — eliminate every duplication you encounter
6. Write tests for each layer
7. Document significant changes

For questions or clarifications, refer to the specific layer documentation or example implementations in the codebase.

---

## Known Technical Debt

> This section tracks known issues that deviate from the guidelines. When working on code in these areas, prioritize resolving the debt incrementally.

| Priority | Issue | Location | Resolution |
|----------|-------|----------|------------|
| 🔴 High | **Layer violation**: `authApi.ts` imports `Environment`/`getBaseUrl` from `presentation/stores/` | `src/infrastructure/api/authApi.ts` | Move `Environment` type and `getBaseUrl()` to `src/shared/` |
| 🔴 High | **Sensitive data logging**: `apiClient.ts` logs full request headers including Bearer tokens via `console.group` without environment check | `src/infrastructure/api/apiClient.ts` | Wrap in `NODE_ENV === 'development'` guard and redact auth headers |
| 🔴 High | **No test infrastructure**: Zero test files, no test runner configured | Project-wide | Set up Vitest + React Testing Library, start with domain entity tests |
| 🟡 Medium | **Dual error hierarchies**: `ApiError` (in apiClient) and `AppError` (in shared/errors) are disconnected with different property names | `src/infrastructure/api/apiClient.ts`, `src/shared/errors/AppError.ts` | Unify: `ApiError` should extend `AppError` or map to it at the boundary |
| 🟡 Medium | **Unused DI container**: inversify container registers CQRS handlers that are not used by the actual app (which uses direct API calls) | `src/di/container.ts` | Either remove unused registrations or integrate them into the actual flow |
| 🟡 Medium | **String-based DI tokens**: Container uses string literals instead of Symbols | `src/di/container.ts` | Migrate to `Symbol.for()` tokens |
| 🟡 Medium | **Zod not used**: `zod` is a dependency but no validation schemas exist in handlers | `src/application/` | Add Zod schemas to all command handlers |
| 🟡 Medium | **Mixed language in errors**: `ErrorBoundary` has English text, `apiClient` has Portuguese | `src/shared/errors/ErrorBoundary.tsx`, `src/infrastructure/api/apiClient.ts` | Standardize: pt-BR for user-facing, English for technical |
| 🟢 Low | **Dead re-export**: `src/shared/errors/Result.ts` re-exports from domain but is never imported | `src/shared/errors/Result.ts` | Remove or migrate all consumers to use it consistently |
| 🟢 Low | **ES5 target**: `tsconfig.json` targets ES5 despite Electron/Chromium runtime supporting ES2020+ | `tsconfig.json` | Update `target` to `es2020` or `es2022` |
| 🟢 Low | **Sequential import**: `importOrchestrator.ts` sends records one-by-one in a loop | `src/infrastructure/api/import/importOrchestrator.ts` | Implement batch processing with configurable concurrency |
| 🟢 Low | **`any` usage**: `AppError.details`, `ErrorResponse.details`, catch blocks use `any` | Multiple files | Replace with `unknown` + type guards |
| 🟢 Low | **Date locale**: `date.ts` formats with `en-US` instead of `pt-BR` | `src/shared/utils/date.ts` | Change to `pt-BR` locale |
