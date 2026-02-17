export interface Query {
  readonly type?: string;
}

export interface QueryBus {
  execute<T>(query: Query): Promise<T>;
}

export class ElectronQueryBus implements QueryBus {
  async execute<T>(query: Query): Promise<T> {
    if (!window.electron) {
      throw new Error('Electron API not available');
    }

    const queryName = query.constructor.name;
    const channel = `query:${this.toCamelCase(queryName)}`;

    try {
      const result = await window.electron.ipcRenderer.invoke(channel, query);
      return result;
    } catch (error) {
      console.error(`Error executing query ${queryName}:`, error);
      throw error;
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/Query$/, '').replace(/^./, c => c.toLowerCase());
  }
}
