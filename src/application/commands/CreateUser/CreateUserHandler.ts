import { z } from 'zod';
import { CreateUserCommand } from './CreateUserCommand';
import { User, UserRole } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUserRepository';
import { IEventBus } from '../../../domain/interfaces/IEventBus';
import { Result } from '../../../shared/errors/Result';
import { ValidationError, ConflictError } from '../../../shared/errors/AppError';
import { UserCreatedEvent } from '../../events/UserCreatedEvent';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
});

export class CreateUserHandler {
  constructor(
    private userRepository: IUserRepository,
    private eventBus: IEventBus
  ) {}

  async handle(command: CreateUserCommand): Promise<Result<User>> {
    try {
      // Validation
      const validated = createUserSchema.parse(command);

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(validated.email);
      if (existingUser) {
        return Result.fail(new ConflictError('User with this email already exists'));
      }

      // Create user entity
      const user = User.create({
        email: validated.email,
        name: validated.name,
        role: validated.role,
      });

      // Persist
      const saveResult = await this.userRepository.save(user);
      if (saveResult.isFailure) {
        return saveResult;
      }

      // Emit domain event
      await this.eventBus.publish(new UserCreatedEvent(user));

      return Result.ok(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail(new ValidationError('Validation failed', error.errors));
      }
      throw error;
    }
  }
}
