import { GetUserQuery } from './GetUserQuery';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { Result } from '../../../shared/errors/Result';
import { NotFoundError } from '../../../shared/errors/AppError';
import { UserDTO } from '../../dto/UserDTO';

export class GetUserHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: GetUserQuery): Promise<Result<UserDTO>> {
    try {
      const user = await this.userRepository.findById(query.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      return Result.ok(UserDTO.fromEntity(user));
    } catch (error) {
      throw error;
    }
  }
}
