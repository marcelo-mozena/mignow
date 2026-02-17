export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private constructor(private props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get price(): number {
    return this.props.price;
  }

  get stock(): number {
    return this.props.stock;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateDetails(name: string, description: string): void {
    this.props.name = name;
    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  public updatePrice(price: number): void {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    this.props.price = price;
    this.props.updatedAt = new Date();
  }

  public addStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    this.props.stock += quantity;
    this.props.updatedAt = new Date();
  }

  public removeStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    if (this.props.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.props.stock -= quantity;
    this.props.updatedAt = new Date();
  }

  public static create(props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const now = new Date();
    return new Product({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  public toJSON(): ProductProps {
    return {
      ...this.props,
      createdAt: new Date(this.props.createdAt.getTime()),
      updatedAt: new Date(this.props.updatedAt.getTime()),
    };
  }
}
