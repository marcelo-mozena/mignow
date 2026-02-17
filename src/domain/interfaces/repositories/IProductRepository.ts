import { Product } from '../../entities/Product';
import { Result } from '../../Result';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByName(name: string): Promise<Product[]>;
  save(product: Product): Promise<Result<Product>>;
  update(product: Product): Promise<Result<Product>>;
  delete(id: string): Promise<Result<void>>;
}
