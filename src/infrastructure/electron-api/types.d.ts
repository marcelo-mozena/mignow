// Type definitions for the Electron API exposed through preload

interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    on(channel: string, func: (...args: unknown[]) => void): void;
    removeListener(channel: string, func: (...args: unknown[]) => void): void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
