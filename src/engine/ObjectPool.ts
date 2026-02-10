export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 20) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    const obj = this.pool.length > 0 ? this.pool.pop()! : this.factory();
    this.reset(obj);
    return obj;
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.pool.push(obj);
    }
  }

  get available(): number {
    return this.pool.length;
  }
}
