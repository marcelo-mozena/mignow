import { ListUsersQuery } from './ListUsersQuery';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { Result } from '../../../domain/Result';
import { UserDTO } from '../../dto/UserDTO';

export interface ListUsersResponse {
  users: UserDTO[];
  total: number;
  page: number;
  limit: number;
}

export class ListUsersHandler {
  constructor(private userRepository: IUserRepository) {}

  async handle(query: ListUsersQuery): Promise<Result<ListUsersResponse>> {
    const allUsers = await this.userRepository.findAll();

    // Simple pagination
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    const users = paginatedUsers.map(user => UserDTO.fromEntity(user));

    return Result.ok({
      users,
      total: allUsers.length,
      page: query.page,
      limit: query.limit,
    });
  }
}
