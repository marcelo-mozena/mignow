import { IEventBus, DomainEvent } from '../../domain/interfaces/IEventBus';

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventType = event.eventType;
    const handlers = this.handlers.get(eventType) || [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    }
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.handlers.set(eventType, handlers);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
