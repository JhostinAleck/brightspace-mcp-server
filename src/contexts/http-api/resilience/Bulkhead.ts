export interface BulkheadOptions {
  maxConcurrent: number;
}

type Resolver = () => void;

export class Bulkhead {
  private active = 0;
  private readonly queue: Resolver[] = [];

  constructor(private readonly opts: BulkheadOptions) {}

  async run<T>(op: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await op();
    } finally {
      this.release();
    }
  }

  pending(): number { return this.queue.length; }
  activeCount(): number { return this.active; }

  private acquire(): Promise<void> {
    if (this.active < this.opts.maxConcurrent) {
      this.active += 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.active += 1;
        resolve();
      });
    });
  }

  private release(): void {
    this.active -= 1;
    const next = this.queue.shift();
    if (next) next();
  }
}
