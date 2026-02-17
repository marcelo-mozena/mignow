import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { Result } from '../../../shared/errors/Result';
import { NotFoundError } from '../../../shared/errors/AppError';

export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<Result<User>> {
    try {
      this.users.set(user.id, user);
      return Result.ok(user);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(user: User): Promise<Result<User>> {
    try {
      if (!this.users.has(user.id)) {
        return Result.fail(new NotFoundError('User not found'));
      }
      this.users.set(user.id, user);
      return Result.ok(user);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!this.users.has(id)) {
        return Result.fail(new NotFoundError('User not found'));
      }
      this.users.delete(id);
      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
