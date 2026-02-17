import { ipcMain } from 'electron';
import { container } from '../../src/di/container';
import { ErrorHandler } from '../../src/shared/errors/ErrorHandler';

/**
 * Generic wrapper for IPC handlers that follow the Result pattern.
 *
 * Eliminates the repeated try/catch + ErrorHandler boilerplate
 * that was copy-pasted in every command and query handler registration.
 */
export function wrapIpcHandler<
  THandler extends {
    handle: (input: any) => Promise<{ isFailure: boolean; error: Error; value: any }>;
  },
>(channel: string, handlerKey: string) {
  ipcMain.handle(channel, async (_, input) => {
    try {
      const handler = container.get<THandler>(handlerKey);
      const result = await handler.handle(input);

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
}
