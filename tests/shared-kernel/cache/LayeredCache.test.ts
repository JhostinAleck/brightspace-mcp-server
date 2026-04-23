import { describe, it, expect, vi } from 'vitest';
import { LayeredCache } from '@/shared-kernel/cache/LayeredCache';
import { InMemoryCache } from '@/shared-kernel/cache/InMemoryCache';

describe('LayeredCache', () => {
  it('reads from memory before hitting persistent', async () => {
    const memory = new InMemoryCache();
    const persistent = new InMemoryCache();
    const pSpy = vi.spyOn(persistent, 'get');
    const cache = new LayeredCache({ memory, persistent });

    await cache.set('k', { n: 1 }, 10_000);
    pSpy.mockClear();
    const got = await cache.get('k');
    expect(got).toEqual({ n: 1 });
    expect(pSpy).not.toHaveBeenCalled();
  });

  it('falls back to persistent on memory miss and backfills memory', async () => {
    const memory = new InMemoryCache();
    const persistent = new InMemoryCache();
    const cache = new LayeredCache({ memory, persistent });

    await persistent.set('k', 42, 10_000);
    const mSpy = vi.spyOn(memory, 'set');

    const got = await cache.get<number>('k');
    expect(got).toBe(42);
    expect(mSpy).toHaveBeenCalled();

    // Next call should hit memory only
    const pSpy = vi.spyOn(persistent, 'get');
    pSpy.mockClear();
    const got2 = await cache.get<number>('k');
    expect(got2).toBe(42);
    expect(pSpy).not.toHaveBeenCalled();
  });

  it('writes go to both layers', async () => {
    const memory = new InMemoryCache();
    const persistent = new InMemoryCache();
    const cache = new LayeredCache({ memory, persistent });

    await cache.set('k', 7, 10_000);
    expect(await memory.get<number>('k')).toBe(7);
    expect(await persistent.get<number>('k')).toBe(7);
  });

  it('delete removes from both layers', async () => {
    const memory = new InMemoryCache();
    const persistent = new InMemoryCache();
    const cache = new LayeredCache({ memory, persistent });

    await cache.set('k', 1, 10_000);
    await cache.delete('k');
    expect(await memory.get('k')).toBeNull();
    expect(await persistent.get('k')).toBeNull();
  });

  it('clear goes to both layers', async () => {
    const memory = new InMemoryCache();
    const persistent = new InMemoryCache();
    const cache = new LayeredCache({ memory, persistent });

    await cache.set('a:1', 1, 10_000);
    await cache.set('b:1', 2, 10_000);
    await cache.clear('a:');
    expect(await cache.get('a:1')).toBeNull();
    expect(await cache.get('b:1')).toBe(2);
  });
});
