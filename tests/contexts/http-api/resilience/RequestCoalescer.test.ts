import { describe, it, expect } from 'vitest';
import { RequestCoalescer } from '@/contexts/http-api/resilience/RequestCoalescer';

describe('RequestCoalescer', () => {
  it('returns the same in-flight promise for the same key', async () => {
    const coalescer = new RequestCoalescer();
    let calls = 0;
    let resolveOp: (v: string) => void;
    const op = () => new Promise<string>((r) => { resolveOp = r; calls++; });

    const a = coalescer.run('k', op);
    const b = coalescer.run('k', op);

    expect(calls).toBe(1);
    resolveOp!('done');
    await expect(a).resolves.toBe('done');
    await expect(b).resolves.toBe('done');
  });

  it('releases the key after completion so next call starts fresh', async () => {
    const coalescer = new RequestCoalescer();
    let calls = 0;
    const op = async () => { calls++; return 'ok'; };

    await coalescer.run('k', op);
    await coalescer.run('k', op);
    expect(calls).toBe(2);
  });

  it('releases the key after rejection', async () => {
    const coalescer = new RequestCoalescer();
    let calls = 0;
    const op = async () => { calls++; throw new Error('x'); };

    await expect(coalescer.run('k', op)).rejects.toThrow('x');
    await expect(coalescer.run('k', op)).rejects.toThrow('x');
    expect(calls).toBe(2);
  });

  it('isolates different keys', async () => {
    const coalescer = new RequestCoalescer();
    let aCalls = 0; let bCalls = 0;
    const a = coalescer.run('a', async () => { aCalls++; return 'A'; });
    const b = coalescer.run('b', async () => { bCalls++; return 'B'; });
    expect([await a, await b]).toEqual(['A', 'B']);
    expect(aCalls).toBe(1);
    expect(bCalls).toBe(1);
  });
});
