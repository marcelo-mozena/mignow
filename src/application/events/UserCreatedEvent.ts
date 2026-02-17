import { DomainEvent } from '../../domain/interfaces/IEventBus';
import { User } from '../../domain/entities/User';

export class UserCreatedEvent extends DomainEvent {
  constructor(public readonly user: User) {
    super();
  }

  get eventType(): string {
    return 'UserCreated';
  }
}
