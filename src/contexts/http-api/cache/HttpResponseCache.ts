import { createHash } from 'node:crypto';
import type { Cache } from '@/shared-kernel/cache/Cache.js';

export interface HttpCacheKey {
  method: string;
  path: string;
  authFingerprint: string;
}

const PREFIX = 'http:';

function fingerprint(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function fullKey(key: HttpCacheKey): string {
  return `${PREFIX}${key.path}:${key.method}:${fingerprint(key.authFingerprint)}`;
}

export class HttpResponseCache {
  constructor(private readonly backing: Cache) {}

  get<T>(key: HttpCacheKey): Promise<T | null> {
    return this.backing.get<T>(fullKey(key));
  }

  set<T>(key: HttpCacheKey, value: T, ttlMs: number): Promise<void> {
    return this.backing.set(fullKey(key), value, ttlMs);
  }

  clearPath(pathPrefix: string): Promise<void> {
    return this.backing.clear(`${PREFIX}${pathPrefix}`);
  }

  clearAll(): Promise<void> {
    return this.backing.clear(PREFIX);
  }
}
