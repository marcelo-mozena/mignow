export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public static create(amount: number, currency: string = 'USD'): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Money(amount, currency.toUpperCase());
  }

  private static round(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(Money.round(this.amount + other.amount), this.currency);
  }

  public subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    const newAmount = Money.round(this.amount - other.amount);
    if (newAmount < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(newAmount, this.currency);
  }

  public multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    return new Money(Money.round(this.amount * factor), this.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  public toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
