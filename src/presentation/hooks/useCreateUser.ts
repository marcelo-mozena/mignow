import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommandBus } from '../providers/CQRSProvider';
import { CreateUserCommand } from '../../application/commands/CreateUser/CreateUserCommand';
import { UserRole } from '../../domain/entities/User';

interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
}

export const useCreateUser = () => {
  const commandBus = useCommandBus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const command = new CreateUserCommand(input.email, input.name, input.role);
      return await commandBus.execute(command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
