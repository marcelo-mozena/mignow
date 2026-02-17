// Type definitions for the Electron API exposed through preload

interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, func: (...args: any[]) => void): void;
    removeListener(channel: string, func: (...args: any[]) => void): void;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
