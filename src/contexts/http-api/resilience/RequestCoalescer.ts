export class RequestCoalescer {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  async run<T>(key: string, op: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = (async () => {
      try {
        return await op();
      } finally {
        this.inFlight.delete(key);
      }
    })();
    this.inFlight.set(key, promise);
    return promise;
  }

  size(): number { return this.inFlight.size; }
}
