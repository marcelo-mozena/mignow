import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommandBus } from '../providers/CQRSProvider';
import { UpdateUserCommand } from '../../application/commands/UpdateUser/UpdateUserCommand';
import { UserRole } from '../../domain/entities/User';

interface UpdateUserInput {
  userId: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export const useUpdateUser = () => {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const command = new UpdateUserCommand(
        input.userId,
        input.name,
        input.email,
        input.role
      );
      return await commandBus.execute(command);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
  });
};
