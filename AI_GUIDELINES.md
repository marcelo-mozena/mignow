# AI Guidelines for Electron React Clean Architecture Project

> **Purpose**: This document provides comprehensive guidelines for AI assistants working with this codebase. It explains the architecture, patterns, and best practices to maintain consistency and quality.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer Responsibilities](#layer-responsibilities)
3. [CQRS Pattern](#cqrs-pattern)
4. [Adding New Features](#adding-new-features)
5. [Error Handling](#error-handling)
6. [Naming Conventions](#naming-conventions)
7. [File Organization](#file-organization)
8. [Common Patterns](#common-patterns)
9. [Testing Strategy](#testing-strategy)
10. [Best Practices](#best-practices)

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

### ❌ Don'ts

1. **Don't bypass layers** (e.g., UI → Repository directly)
2. **Don't put business logic in UI components**
3. **Don't return domain entities** from queries
4. **Don't use concrete classes** in domain interfaces
5. **Don't throw errors** without using Result pattern
6. **Don't skip validation** in command handlers
7. **Don't create circular dependencies**
8. **Don't mix concerns** (e.g., UI logic in handlers)
9. **Don't use `any` type** unless absolutely necessary
10. **Don't modify entities** directly from outside

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
5. Write tests for each layer
6. Document significant changes

For questions or clarifications, refer to the specific layer documentation or example implementations in the codebase.
