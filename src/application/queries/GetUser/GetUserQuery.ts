export class GetUserQuery {
  public readonly type = 'GetUserQuery' as const;

  constructor(public readonly userId: string) {}
}
