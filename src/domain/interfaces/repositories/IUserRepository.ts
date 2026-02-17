import { User } from '../../entities/User';
import { Result } from '../../Result';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<Result<User>>;
  update(user: User): Promise<Result<User>>;
  delete(id: string): Promise<Result<void>>;
}
