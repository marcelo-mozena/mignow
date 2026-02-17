import { z } from 'zod';
import { UpdateUserCommand } from './UpdateUserCommand';
import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IEventBus } from '../../../domain/interfaces/IEventBus';
import { Result } from '../../../domain/Result';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';
import { UserUpdatedEvent } from '../../events/UserUpdatedEvent';

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export class UpdateUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private eventBus: IEventBus
  ) {}

  async handle(command: UpdateUserCommand): Promise<Result<User>> {
    try {
      // Validation
      const validated = updateUserSchema.parse(command);

      // Find user
      const user = await this.userRepository.findById(validated.userId);
      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      // Update user properties
      if (validated.name !== undefined) {
        user.updateName(validated.name);
      }
      if (validated.email !== undefined) {
        user.updateEmail(validated.email);
      }
      if (validated.role !== undefined) {
        user.changeRole(validated.role);
      }

      // Persist
      const updateResult = await this.userRepository.update(user);
      if (updateResult.isFailure) {
        return updateResult;
      }

      // Emit domain event
      await this.eventBus.publish(new UserUpdatedEvent(user));

      return Result.ok(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail(new ValidationError('Validation failed', error.errors));
      }
      throw error;
    }
  }
}
