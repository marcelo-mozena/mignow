import { useQuery } from '@tanstack/react-query';
import { useQueryBus } from '../providers/CQRSProvider';
import { GetUserQuery } from '../../application/queries/GetUser/GetUserQuery';
import { UserDTO } from '../../application/dto/UserDTO';

export const useUser = (userId: string) => {
  const queryBus = useQueryBus();

  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const result = await queryBus.execute<{ value: UserDTO }>(
        new GetUserQuery(userId)
      );
      return result.value;
    },
    enabled: !!userId,
  });
};
