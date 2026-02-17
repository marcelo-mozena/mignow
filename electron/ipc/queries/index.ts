import { GetUserHandler } from '../../../src/application/queries/GetUser/GetUserHandler';
import { ListUsersHandler } from '../../../src/application/queries/ListUsers/ListUsersHandler';
import { wrapIpcHandler } from '../utils';

export function registerQueryHandlers() {
  wrapIpcHandler<GetUserHandler>('query:getUser', 'GetUserHandler');
  wrapIpcHandler<ListUsersHandler>('query:listUsers', 'ListUsersHandler');

  // Add more query handlers as needed
}
