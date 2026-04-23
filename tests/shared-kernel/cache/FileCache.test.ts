import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileCache } from '@/shared-kernel/cache/FileCache';

describe('FileCache', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'fc-'));
    vi.useFakeTimers();
    return () => { rmSync(dir, { recursive: true, force: true }); vi.useRealTimers(); };
  });
  afterEach(() => { vi.useRealTimers(); });

  it('round-trips a value across instances', async () => {
    const path = join(dir, 'cache.json');
    const a = new FileCache({ path });
    await a.set('k', { n: 1 }, 10_000);
    const b = new FileCache({ path });
    const got = await b.get<{ n: number }>('k');
    expect(got).toEqual({ n: 1 });
  });

  it('expires after TTL', async () => {
    const path = join(dir, 'cache.json');
    const cache = new FileCache({ path });
    await cache.set('k', 1, 1_000);
    vi.advanceTimersByTime(1_500);
    expect(await cache.get('k')).toBeNull();
  });

  it('delete removes a key', async () => {
    const path = join(dir, 'cache.json');
    const cache = new FileCache({ path });
    await cache.set('k', 1, 10_000);
    await cache.delete('k');
    expect(await cache.get('k')).toBeNull();
  });

  it('clear with prefix removes matching keys', async () => {
    const path = join(dir, 'cache.json');
    const cache = new FileCache({ path });
    await cache.set('a:1', 1, 10_000);
    await cache.set('a:2', 2, 10_000);
    await cache.set('b:1', 3, 10_000);
    await cache.clear('a:');
    expect(await cache.get('a:1')).toBeNull();
    expect(await cache.get('a:2')).toBeNull();
    expect(await cache.get('b:1')).toBe(3);
  });

  it('clear without prefix removes everything', async () => {
    const path = join(dir, 'cache.json');
    const cache = new FileCache({ path });
    await cache.set('a', 1, 10_000);
    await cache.set('b', 2, 10_000);
    await cache.clear();
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBeNull();
  });
});
