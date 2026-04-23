import { describe, it, expect } from 'vitest';
import { RetryPolicy, type RetryClassifier } from '@/contexts/http-api/resilience/RetryPolicy.js';

const retryAll: RetryClassifier = () => ({ retry: true });
const retryNone: RetryClassifier = () => ({ retry: false });

describe('RetryPolicy', () => {
  it('returns result immediately on success', async () => {
    const policy = new RetryPolicy({
      maxAttempts: 3, initialMs: 10, maxMs: 100, classifier: retryAll, sleep: async () => {},
    });
    const result = await policy.run(async () => 'ok');
    expect(result).toBe('ok');
  });

  it('retries until maxAttempts then throws', async () => {
    let calls = 0;
    const policy = new RetryPolicy({
      maxAttempts: 3, initialMs: 10, maxMs: 100, classifier: retryAll, sleep: async () => {},
    });
    await expect(
      policy.run(async () => { calls++; throw new Error('boom'); }),
    ).rejects.toThrow('boom');
    expect(calls).toBe(3);
  });

  it('does not retry when classifier says so', async () => {
    let calls = 0;
    const policy = new RetryPolicy({
      maxAttempts: 5, initialMs: 10, maxMs: 100, classifier: retryNone, sleep: async () => {},
    });
    await expect(
      policy.run(async () => { calls++; throw new Error('permanent'); }),
    ).rejects.toThrow('permanent');
    expect(calls).toBe(1);
  });

  it('honors Retry-After seconds from classifier', async () => {
    const sleeps: number[] = [];
    const policy = new RetryPolicy({
      maxAttempts: 3,
      initialMs: 10,
      maxMs: 10_000,
      classifier: () => ({ retry: true, retryAfterMs: 500 }),
      sleep: async (ms) => { sleeps.push(ms); },
    });
    await expect(
      policy.run(async () => { throw new Error('429'); }),
    ).rejects.toThrow();
    expect(sleeps).toEqual([500, 500]); // 2 sleeps between 3 attempts
  });

  it('applies exponential backoff with jitter when no Retry-After', async () => {
    const sleeps: number[] = [];
    const policy = new RetryPolicy({
      maxAttempts: 4,
      initialMs: 100,
      maxMs: 10_000,
      classifier: retryAll,
      jitter: (base) => base,
      sleep: async (ms) => { sleeps.push(ms); },
    });
    await expect(policy.run(async () => { throw new Error('x'); })).rejects.toThrow();
    // 100, 200, 400 — 3 sleeps between 4 attempts
    expect(sleeps).toEqual([100, 200, 400]);
  });

  it('caps sleep at maxMs', async () => {
    const sleeps: number[] = [];
    const policy = new RetryPolicy({
      maxAttempts: 5,
      initialMs: 100,
      maxMs: 300,
      classifier: retryAll,
      jitter: (base) => base,
      sleep: async (ms) => { sleeps.push(ms); },
    });
    await expect(policy.run(async () => { throw new Error('x'); })).rejects.toThrow();
    // 100, 200, 300 (capped), 300 (capped) — 4 sleeps between 5 attempts
    expect(sleeps).toEqual([100, 200, 300, 300]);
  });
});
