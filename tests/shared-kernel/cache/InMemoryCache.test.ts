import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InMemoryCache } from '@/shared-kernel/cache/InMemoryCache';

describe('InMemoryCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('stores and retrieves a value', async () => {
    const c = new InMemoryCache();
    await c.set('k', { n: 1 }, 1000);
    expect(await c.get<{ n: number }>('k')).toEqual({ n: 1 });
  });

  it('returns null for missing key', async () => {
    const c = new InMemoryCache();
    expect(await c.get('nope')).toBeNull();
  });

  it('expires after TTL', async () => {
    const c = new InMemoryCache();
    await c.set('k', 1, 1000);
    vi.advanceTimersByTime(1001);
    expect(await c.get('k')).toBeNull();
  });

  it('delete() removes key', async () => {
    const c = new InMemoryCache();
    await c.set('k', 1, 1000);
    await c.delete('k');
    expect(await c.get('k')).toBeNull();
  });

  it('clear() with prefix removes matching keys only', async () => {
    const c = new InMemoryCache();
    await c.set('a:1', 1, 10_000);
    await c.set('a:2', 2, 10_000);
    await c.set('b:1', 3, 10_000);
    await c.clear('a:');
    expect(await c.get('a:1')).toBeNull();
    expect(await c.get('a:2')).toBeNull();
    expect(await c.get('b:1')).toBe(3);
  });
});
