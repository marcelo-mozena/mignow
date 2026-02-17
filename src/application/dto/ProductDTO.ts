import { Product } from '../../domain/entities/Product';

export class ProductDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  public static fromEntity(product: Product): ProductDTO {
    return new ProductDTO(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.createdAt.toISOString(),
      product.updatedAt.toISOString()
    );
  }
}
