import { UserRole } from '../../../domain/entities/User';

export class UpdateUserCommand {
  public readonly type = 'UpdateUserCommand' as const;

  constructor(
    public readonly userId: string,
    public readonly name?: string,
    public readonly email?: string,
    public readonly role?: UserRole
  ) {}
}
