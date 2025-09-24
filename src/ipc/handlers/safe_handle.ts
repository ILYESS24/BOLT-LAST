import { IpcMainInvokeEvent } from 'electron';

export function safeHandle<T extends any[], R>(
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>
) {
  return async (event: IpcMainInvokeEvent, ...args: T): Promise<R> => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error('Error in IPC handler:', error);
      throw error;
    }
  };
}

export function createLoggedHandler<T extends any[], R>(
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>
) {
  return safeHandle(handler);
}

export function createTestOnlyLoggedHandler<T extends any[], R>(
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>
) {
  return safeHandle(handler);
}

// Fonction pour créer un handler avec logging
export function createHandlerWithLogging<T extends any[], R>(
  logger: any,
  handler: (event: IpcMainInvokeEvent, ...args: T) => Promise<R>
) {
  return safeHandle(handler);
}