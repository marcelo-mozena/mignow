import { Product } from '../../../domain/entities/Product';
import { IProductRepository } from '../../../domain/interfaces/repositories/IProductRepository';
import { Result } from '../../../shared/errors/Result';
import { NotFoundError } from '../../../shared/errors/AppError';

export class ProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findByName(name: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    return products.filter(product => 
      product.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async save(product: Product): Promise<Result<Product>> {
    try {
      this.products.set(product.id, product);
      return Result.ok(product);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(product: Product): Promise<Result<Product>> {
    try {
      if (!this.products.has(product.id)) {
        return Result.fail(new NotFoundError('Product not found'));
      }
      this.products.set(product.id, product);
      return Result.ok(product);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!this.products.has(id)) {
        return Result.fail(new NotFoundError('Product not found'));
      }
      this.products.delete(id);
      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
