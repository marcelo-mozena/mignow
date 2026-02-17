import { ipcMain } from 'electron';
import { container } from '../../../src/di/container';
import { GetUserHandler } from '../../../src/application/queries/GetUser/GetUserHandler';
import { ListUsersHandler } from '../../../src/application/queries/ListUsers/ListUsersHandler';
import { ErrorHandler } from '../../../src/shared/errors/ErrorHandler';

export function registerQueryHandlers() {
  // Get User Query
  ipcMain.handle('query:getUser', async (_, query) => {
    try {
      const handler = container.get<GetUserHandler>('GetUserHandler');
      const result = await handler.handle(query);

      if (result.isFailure) {
        const errorResponse = ErrorHandler.handle(result.error);
        throw new Error(JSON.stringify(errorResponse));
      }

      return result.value;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('{')) {
        throw error; // Already formatted error, re-throw
      }
      const errorResponse = ErrorHandler.handle(error);
      throw new Error(JSON.stringify(errorResponse));
    }
  });

  // List Users Query
  ipcMain.handle('query:listUsers', async (_, query) => {
    try {
      const handler = container.get<ListUsersHandler>('ListUsersHandler');
      const result = await handler.handle(query);

      if (result.isFailure) {
        const errorResponse = ErrorHandler.handle(result.error);
        throw new Error(JSON.stringify(errorResponse));
      }

      return result.value;
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('{')) {
        throw error; // Already formatted error, re-throw
      }
      const errorResponse = ErrorHandler.handle(error);
      throw new Error(JSON.stringify(errorResponse));
    }
  });

  // Add more query handlers as needed
}
