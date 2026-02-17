import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      // Whitelist channels — exact match for security
      const validChannels = [
        'command:createUser',
        'command:updateUser',
        'query:getUser',
        'query:listUsers',
        'env:saveOrgs',
      ];

      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }

      throw new Error(`Invalid channel: ${channel}`);
    },
    on: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['notification', 'update-available'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_, ...args) => func(...args));
      }
    },
    removeListener: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.removeListener(channel, func);
    },
  },
});
