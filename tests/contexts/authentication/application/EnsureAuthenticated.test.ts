import { describe, it, expect } from 'vitest';
import { EnsureAuthenticated } from '@/contexts/authentication/application/EnsureAuthenticated.js';
import { InMemorySessionCache } from '@/contexts/authentication/infrastructure/session-caches/InMemorySessionCache.js';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken.js';
import { UserId } from '@/shared-kernel/types/UserId.js';
import type { AuthStrategy } from '@/contexts/authentication/domain/AuthStrategy.js';
import type { Session } from '@/contexts/authentication/domain/Session.js';
import { ConfigBackedStrategyResolver } from '@/contexts/authentication/application/ConfigBackedStrategyResolver.js';

const makeStrategy = () => {
  let calls = 0;
  const strategy: AuthStrategy = {
    kind: 'api_token',
    async authenticate(ctx) {
      calls++;
      return {
        token: AccessToken.bearer('t'),
        profile: ctx.profile,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        source: 'api_token',
        userIdentity: { userId: UserId.of(1), displayName: 'U', uniqueName: 'u' },
      } satisfies Session;
    },
    canRefresh() { return false; },
  };
  return { strategy, getCalls: () => calls };
};

describe('EnsureAuthenticated', () => {
  it('calls strategy on cache miss, caches result', async () => {
    const cache = new InMemorySessionCache();
    const { strategy, getCalls } = makeStrategy();
    const uc = new EnsureAuthenticated(cache, strategy);
    const s1 = await uc.execute({ profile: 'p', baseUrl: 'https://x' });
    const s2 = await uc.execute({ profile: 'p', baseUrl: 'https://x' });
    expect(s1.profile).toBe('p');
    expect(s2.profile).toBe('p');
    expect(getCalls()).toBe(1);
  });

  it('falls back to the next strategy when primary fails', async () => {
    const cache = new InMemorySessionCache();
    const primary: AuthStrategy = {
      kind: 'api_token',
      async authenticate() { throw new Error('primary down'); },
      canRefresh() { return false; },
    };
    const fallback: AuthStrategy = {
      kind: 'session_cookie',
      async authenticate(ctx) {
        return {
          token: AccessToken.cookie('fb'),
          profile: ctx.profile,
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
          source: 'session_cookie',
          userIdentity: { userId: UserId.of(1), displayName: 'F', uniqueName: 'f' },
        };
      },
      canRefresh() { return false; },
    };
    const resolver = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'api_token', fallbacks: ['session_cookie'] } } as never,
      strategies: { api_token: primary, session_cookie: fallback },
    });
    const uc = new EnsureAuthenticated(cache, resolver);
    const sess = await uc.execute({ profile: 'p', baseUrl: 'https://x' });
    expect(sess.source).toBe('session_cookie');
  });

  it('throws FallbackChainExhaustedError when all strategies fail', async () => {
    const cache = new InMemorySessionCache();
    const a: AuthStrategy = { kind: 'api_token', async authenticate() { throw new Error('a'); }, canRefresh() { return false; } };
    const b: AuthStrategy = { kind: 'session_cookie', async authenticate() { throw new Error('b'); }, canRefresh() { return false; } };
    const resolver = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'api_token', fallbacks: ['session_cookie'] } } as never,
      strategies: { api_token: a, session_cookie: b },
    });
    const uc = new EnsureAuthenticated(cache, resolver);
    await expect(uc.execute({ profile: 'p', baseUrl: 'https://x' })).rejects.toThrow(/fallback|exhausted|all/i);
  });
});
