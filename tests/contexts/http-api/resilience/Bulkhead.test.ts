import { describe, it, expect } from 'vitest';
import { Bulkhead } from '@/contexts/http-api/resilience/Bulkhead';

describe('Bulkhead', () => {
  it('runs up to maxConcurrent operations in parallel', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 2 });
    let inFlight = 0;
    let peak = 0;
    const op = async () => {
      inFlight++; peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 10));
      inFlight--;
      return 'ok';
    };
    await Promise.all([bulkhead.run(op), bulkhead.run(op), bulkhead.run(op), bulkhead.run(op)]);
    expect(peak).toBeLessThanOrEqual(2);
  });

  it('queues excess calls and processes them FIFO', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1 });
    const order: number[] = [];
    const p1 = bulkhead.run(async () => { order.push(1); });
    const p2 = bulkhead.run(async () => { order.push(2); });
    const p3 = bulkhead.run(async () => { order.push(3); });
    await Promise.all([p1, p2, p3]);
    expect(order).toEqual([1, 2, 3]);
  });

  it('releases slot on rejection so pending calls continue', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1 });
    await expect(bulkhead.run(async () => { throw new Error('x'); })).rejects.toThrow('x');
    const value = await bulkhead.run(async () => 'ok');
    expect(value).toBe('ok');
  });

  it('reports pending count', async () => {
    const bulkhead = new Bulkhead({ maxConcurrent: 1 });
    let resolveA: () => void;
    const a = bulkhead.run(() => new Promise<void>((r) => { resolveA = r; }));
    const b = bulkhead.run(async () => {});
    // Give microtasks a chance to enqueue
    await Promise.resolve();
    expect(bulkhead.pending()).toBe(1);
    resolveA!();
    await Promise.all([a, b]);
    expect(bulkhead.pending()).toBe(0);
  });
});
