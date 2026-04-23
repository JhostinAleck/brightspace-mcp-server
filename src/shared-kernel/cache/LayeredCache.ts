import type { Cache } from './Cache.js';

export interface LayeredCacheOptions {
  memory: Cache;
  persistent: Cache;
  memoryBackfillTtlMs?: number;
}

export class LayeredCache implements Cache {
  constructor(private readonly opts: LayeredCacheOptions) {}

  async get<T>(key: string): Promise<T | null> {
    const fromMemory = await this.opts.memory.get<T>(key);
    if (fromMemory !== null) return fromMemory;
    const fromPersistent = await this.opts.persistent.get<T>(key);
    if (fromPersistent !== null) {
      await this.opts.memory.set(key, fromPersistent, this.opts.memoryBackfillTtlMs ?? 60_000);
    }
    return fromPersistent;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await Promise.all([
      this.opts.memory.set(key, value, ttlMs),
      this.opts.persistent.set(key, value, ttlMs),
    ]);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([this.opts.memory.delete(key), this.opts.persistent.delete(key)]);
  }

  async clear(prefix?: string): Promise<void> {
    await Promise.all([this.opts.memory.clear(prefix), this.opts.persistent.clear(prefix)]);
  }
}
