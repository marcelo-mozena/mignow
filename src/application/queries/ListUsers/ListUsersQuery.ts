export class ListUsersQuery {
  public readonly type = 'ListUsersQuery' as const;

  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}
