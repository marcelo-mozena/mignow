import { useQuery } from '@tanstack/react-query';
import { useQueryBus } from '../providers/CQRSProvider';
import { ListUsersQuery } from '../../application/queries/ListUsers/ListUsersQuery';
import { UserDTO } from '../../application/dto/UserDTO';

export interface ListUsersParams {
  page?: number;
  limit?: number;
}

export const useUsers = ({ page = 1, limit = 10 }: ListUsersParams = {}) => {
  const queryBus = useQueryBus();

  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const result = await queryBus.execute<{
        value: {
          users: UserDTO[];
          total: number;
          page: number;
          limit: number;
        };
      }>(new ListUsersQuery(page, limit));
      return result.value;
    },
  });
};
