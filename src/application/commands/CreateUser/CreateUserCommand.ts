import { UserRole } from '../../../domain/entities/User';

export class CreateUserCommand {
  public readonly type = 'CreateUserCommand' as const;

  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole
  ) {}
}
