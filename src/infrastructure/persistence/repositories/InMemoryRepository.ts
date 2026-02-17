import { Result } from '../../../domain/Result';
import { NotFoundError } from '../../../shared/errors/AppError';

/**
 * Generic in-memory repository base class.
 *
 * Provides default CRUD operations backed by a `Map`.
 * Subclasses only need to implement entity-specific queries
 * (e.g. findByEmail, findByName) and set `entityName`.
 */
export abstract class InMemoryRepository<T extends { readonly id: string }> {
  protected items: Map<string, T> = new Map();

  /** Human-readable entity name used in error messages. */
  protected abstract get entityName(): string;

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }

  async save(item: T): Promise<Result<T>> {
    try {
      this.items.set(item.id, item);
      return Result.ok(item);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async update(item: T): Promise<Result<T>> {
    try {
      if (!this.items.has(item.id)) {
        return Result.fail(new NotFoundError(`${this.entityName} not found`));
      }
      this.items.set(item.id, item);
      return Result.ok(item);
    } catch (error) {
      return Result.fail(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      if (!this.items.has(id)) {
        return Result.fail(new NotFoundError(`${this.entityName} not found`));
      }
      this.items.delete(id);
      return Result.ok();
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
