import { Product } from '../../../domain/entities/Product';
import { IProductRepository } from '../../../domain/interfaces/repositories/IProductRepository';
import { InMemoryRepository } from './InMemoryRepository';

export class ProductRepository extends InMemoryRepository<Product> implements IProductRepository {
  protected get entityName() { return 'Product'; }

  async findByName(name: string): Promise<Product[]> {
    const products = Array.from(this.items.values());
    return products.filter(product =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}
