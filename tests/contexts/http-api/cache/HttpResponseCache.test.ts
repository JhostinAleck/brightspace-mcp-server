import { describe, it, expect } from 'vitest';
import { HttpResponseCache } from '@/contexts/http-api/cache/HttpResponseCache';
import { InMemoryCache } from '@/shared-kernel/cache/InMemoryCache';

describe('HttpResponseCache', () => {
  it('stores and retrieves a response body by method+path+auth', async () => {
    const backing = new InMemoryCache();
    const cache = new HttpResponseCache(backing);
    await cache.set({ method: 'GET', path: '/a', authFingerprint: 'user1' }, { x: 1 }, 60_000);
    const got = await cache.get<{ x: number }>({ method: 'GET', path: '/a', authFingerprint: 'user1' });
    expect(got).toEqual({ x: 1 });
  });

  it('isolates entries by auth fingerprint (no cross-user leak)', async () => {
    const backing = new InMemoryCache();
    const cache = new HttpResponseCache(backing);
    await cache.set({ method: 'GET', path: '/a', authFingerprint: 'user1' }, { who: 'u1' }, 60_000);
    const got = await cache.get<{ who: string }>({ method: 'GET', path: '/a', authFingerprint: 'user2' });
    expect(got).toBeNull();
  });

  it('isolates entries by path', async () => {
    const backing = new InMemoryCache();
    const cache = new HttpResponseCache(backing);
    await cache.set({ method: 'GET', path: '/a', authFingerprint: 'u' }, 'A', 60_000);
    expect(await cache.get({ method: 'GET', path: '/b', authFingerprint: 'u' })).toBeNull();
  });

  it('clearPath removes all entries for a path prefix', async () => {
    const backing = new InMemoryCache();
    const cache = new HttpResponseCache(backing);
    await cache.set({ method: 'GET', path: '/courses/1', authFingerprint: 'u' }, 'one', 60_000);
    await cache.set({ method: 'GET', path: '/courses/2', authFingerprint: 'u' }, 'two', 60_000);
    await cache.set({ method: 'GET', path: '/other', authFingerprint: 'u' }, 'x', 60_000);
    await cache.clearPath('/courses/');
    expect(await cache.get({ method: 'GET', path: '/courses/1', authFingerprint: 'u' })).toBeNull();
    expect(await cache.get({ method: 'GET', path: '/courses/2', authFingerprint: 'u' })).toBeNull();
    expect(await cache.get({ method: 'GET', path: '/other', authFingerprint: 'u' })).toBe('x');
  });

  it('clearAll removes everything', async () => {
    const backing = new InMemoryCache();
    const cache = new HttpResponseCache(backing);
    await cache.set({ method: 'GET', path: '/a', authFingerprint: 'u' }, 1, 60_000);
    await cache.set({ method: 'GET', path: '/b', authFingerprint: 'u' }, 2, 60_000);
    await cache.clearAll();
    expect(await cache.get({ method: 'GET', path: '/a', authFingerprint: 'u' })).toBeNull();
    expect(await cache.get({ method: 'GET', path: '/b', authFingerprint: 'u' })).toBeNull();
  });
});
