import { User, UserRole } from '../../domain/entities/User';

export class UserDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  public static fromEntity(user: User): UserDTO {
    return new UserDTO(
      user.id,
      user.email,
      user.name,
      user.role,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    );
  }
}
