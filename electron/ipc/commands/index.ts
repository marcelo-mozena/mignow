import { ipcMain } from 'electron';
import { container } from '../../../src/di/container';
import { CreateUserHandler } from '../../../src/application/commands/CreateUser/CreateUserHandler';
import { UpdateUserHandler } from '../../../src/application/commands/UpdateUser/UpdateUserHandler';
import { ErrorHandler } from '../../../src/shared/errors/ErrorHandler';

export function registerCommandHandlers() {
  // Create User Command
  ipcMain.handle('command:createUser', async (_, command) => {
    try {
      const handler = container.get<CreateUserHandler>('CreateUserHandler');
      const result = await handler.handle(command);

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

  // Update User Command
  ipcMain.handle('command:updateUser', async (_, command) => {
    try {
      const handler = container.get<UpdateUserHandler>('UpdateUserHandler');
      const result = await handler.handle(command);

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

  // Add more command handlers as needed
}
