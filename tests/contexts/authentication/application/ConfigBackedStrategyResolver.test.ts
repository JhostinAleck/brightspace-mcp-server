import { describe, it, expect } from 'vitest';
import { ConfigBackedStrategyResolver } from '@/contexts/authentication/application/ConfigBackedStrategyResolver';
import { ApiTokenStrategy } from '@/contexts/authentication/infrastructure/strategies/ApiTokenStrategy';
import { SessionCookieStrategy } from '@/contexts/authentication/infrastructure/strategies/SessionCookieStrategy';
import { UserId } from '@/shared-kernel/types/UserId';
import { FakeCredentialStore } from '@tests/helpers/fakes/FakeCredentialStore';

const whoami = async () => ({
  userId: UserId.of(1),
  displayName: 'x',
  uniqueName: 'x@x',
});

const apiStrategy = new ApiTokenStrategy({
  tokenRef: 'env:T',
  credentialStore: new FakeCredentialStore({ 'env:T': 'tok' }),
  whoami,
});
const cookieStrategy = new SessionCookieStrategy({
  cookieRef: 'env:C',
  credentialStore: new FakeCredentialStore({ 'env:C': 'ck' }),
  whoami,
  sessionTtlMs: 60_000,
});

describe('ConfigBackedStrategyResolver', () => {
  it('returns the explicit strategy when profile.auth.strategy is set', () => {
    const r = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'api_token', fallbacks: [] } } as never,
      strategies: { api_token: apiStrategy, session_cookie: cookieStrategy },
    });
    expect(r.resolvePrimary().kind).toBe('api_token');
    expect(r.resolveFallbacks()).toEqual([]);
  });

  it('returns fallbacks in declared order', () => {
    const r = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'api_token', fallbacks: ['session_cookie'] } } as never,
      strategies: { api_token: apiStrategy, session_cookie: cookieStrategy },
    });
    expect(r.resolveFallbacks().map((s) => s.kind)).toEqual(['session_cookie']);
  });

  it('auto-detect picks api_token when env var present', () => {
    const r = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'auto', fallbacks: [] } } as never,
      strategies: { api_token: apiStrategy, session_cookie: cookieStrategy },
      autoDetect: { apiTokenEnvPresent: true, sessionCookieConfigured: false },
    });
    expect(r.resolvePrimary().kind).toBe('api_token');
  });

  it('auto-detect falls back to session_cookie when only that is configured', () => {
    const r = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'auto', fallbacks: [] } } as never,
      strategies: { api_token: apiStrategy, session_cookie: cookieStrategy },
      autoDetect: { apiTokenEnvPresent: false, sessionCookieConfigured: true },
    });
    expect(r.resolvePrimary().kind).toBe('session_cookie');
  });

  it('throws AuthConfigError when no strategy is available', () => {
    const r = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'auto', fallbacks: [] } } as never,
      strategies: { api_token: apiStrategy, session_cookie: cookieStrategy },
      autoDetect: { apiTokenEnvPresent: false, sessionCookieConfigured: false },
    });
    expect(() => r.resolvePrimary()).toThrow(/auth/i);
  });

  it('throws when explicit strategy kind has no implementation registered', () => {
    const r = new ConfigBackedStrategyResolver({
      profile: { auth: { strategy: 'browser', fallbacks: [] } } as never,
      strategies: { api_token: apiStrategy },
    });
    expect(() => r.resolvePrimary()).toThrow(/browser/i);
  });
});
