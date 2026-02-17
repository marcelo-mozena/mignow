export interface Command {
  readonly type?: string;
}

export interface CommandBus {
  execute<T>(command: Command): Promise<T>;
}

export class ElectronCommandBus implements CommandBus {
  async execute<T>(command: Command): Promise<T> {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    const commandName = command.constructor.name;
    const channel = `command:${this.toCamelCase(commandName)}`;

    try {
      const result = await window.electron.ipcRenderer.invoke(channel, command);
      return result;
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      throw error;
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/Command$/, '').replace(/^./, c => c.toLowerCase());
  }
}
