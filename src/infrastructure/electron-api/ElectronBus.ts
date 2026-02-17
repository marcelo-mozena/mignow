/**
 * Generic Electron IPC bus.
 *
 * Both CommandBus and QueryBus share the same execute-over-IPC logic;
 * only the channel prefix and the name-suffix pattern differ.
 * This base class eliminates the duplication.
 */
export interface BusMessage {
  readonly type?: string;
}

export interface MessageBus {
  execute<T>(message: BusMessage): Promise<T>;
}

export class ElectronBus implements MessageBus {
  constructor(
    private readonly prefix: string,
    private readonly suffixPattern: RegExp
  ) {}

  async execute<T>(message: BusMessage): Promise<T> {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    const messageName = message.constructor.name;
    const channel = `${this.prefix}:${this.toCamelCase(messageName)}`;

    try {
      const result = await window.electron.ipcRenderer.invoke(channel, message);
      return result;
    } catch (error) {
      console.error(`Error executing ${this.prefix} ${messageName}:`, error);
      throw error;
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(this.suffixPattern, '').replace(/^./, c => c.toLowerCase());
  }
}
