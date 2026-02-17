import { CreateUserHandler } from '../../../src/application/commands/CreateUser/CreateUserHandler';
import { UpdateUserHandler } from '../../../src/application/commands/UpdateUser/UpdateUserHandler';
import { wrapIpcHandler } from '../utils';

export function registerCommandHandlers() {
  wrapIpcHandler<CreateUserHandler>('command:createUser', 'CreateUserHandler');
  wrapIpcHandler<UpdateUserHandler>('command:updateUser', 'UpdateUserHandler');

  // Add more command handlers as needed
}
