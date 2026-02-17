import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { InMemoryRepository } from './InMemoryRepository';

export class UserRepository extends InMemoryRepository<User> implements IUserRepository {
  protected get entityName() { return 'User'; }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.items.values());
    return users.find(user => user.email === email) || null;
  }
}
