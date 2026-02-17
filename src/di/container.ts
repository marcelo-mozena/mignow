import 'reflect-metadata';
import { Container } from 'inversify';
import { IUserRepository } from '../domain/interfaces/repositories/IUserRepository';
import { IProductRepository } from '../domain/interfaces/repositories/IProductRepository';
import { IEventBus } from '../domain/interfaces/IEventBus';
import { UserRepository } from '../infrastructure/persistence/repositories/UserRepository';
import { ProductRepository } from '../infrastructure/persistence/repositories/ProductRepository';
import { InMemoryEventBus } from '../infrastructure/persistence/InMemoryEventBus';
import { CreateUserHandler } from '../application/commands/CreateUser/CreateUserHandler';
import { UpdateUserHandler } from '../application/commands/UpdateUser/UpdateUserHandler';
import { GetUserHandler } from '../application/queries/GetUser/GetUserHandler';
import { ListUsersHandler } from '../application/queries/ListUsers/ListUsersHandler';

// Create the IoC container
export const container = new Container();

// Bind repositories
container.bind<IUserRepository>('UserRepository')
  .to(UserRepository)
  .inSingletonScope();

container.bind<IProductRepository>('ProductRepository')
  .to(ProductRepository)
  .inSingletonScope();

// Bind event bus
container.bind<IEventBus>('EventBus')
  .to(InMemoryEventBus)
  .inSingletonScope();

// Bind command handlers
container.bind<CreateUserHandler>('CreateUserHandler')
  .toDynamicValue((context) => {
    const userRepository = context.container.get<IUserRepository>('UserRepository');
    const eventBus = context.container.get<IEventBus>('EventBus');
    return new CreateUserHandler(userRepository, eventBus);
  });

container.bind<UpdateUserHandler>('UpdateUserHandler')
  .toDynamicValue((context) => {
    const userRepository = context.container.get<IUserRepository>('UserRepository');
    const eventBus = context.container.get<IEventBus>('EventBus');
    return new UpdateUserHandler(userRepository, eventBus);
  });

// Bind query handlers
container.bind<GetUserHandler>('GetUserHandler')
  .toDynamicValue((context) => {
    const userRepository = context.container.get<IUserRepository>('UserRepository');
    return new GetUserHandler(userRepository);
  });

container.bind<ListUsersHandler>('ListUsersHandler')
  .toDynamicValue((context) => {
    const userRepository = context.container.get<IUserRepository>('UserRepository');
    return new ListUsersHandler(userRepository);
  });

// Export getter functions for easier access
export const getUserRepository = () => container.get<IUserRepository>('UserRepository');
export const getProductRepository = () => container.get<IProductRepository>('ProductRepository');
export const getEventBus = () => container.get<IEventBus>('EventBus');
