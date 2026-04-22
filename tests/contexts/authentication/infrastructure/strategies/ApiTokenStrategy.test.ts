import { describe, it, expect } from 'vitest';
import { ApiTokenStrategy } from '@/contexts/authentication/infrastructure/strategies/ApiTokenStrategy.js';
import { SecretValue } from '@/contexts/authentication/domain/SecretValue.js';
import { UserId } from '@/shared-kernel/types/UserId.js';

describe('ApiTokenStrategy', () => {
  const whoami = async () => ({
    userId: UserId.of(99),
    displayName: 'Test',
    uniqueName: 'test@example.com',
  });
  const credStore = {
    get: async () => new SecretValue('tok_abc'),
    set: async () => {},
    delete: async () => {},
  };

  it('authenticates and returns a Session with bearer token', async () => {
    const s = new ApiTokenStrategy({ tokenRef: 'env:TOK', credentialStore: credStore, whoami });
    const sess = await s.authenticate({ profile: 'p1', baseUrl: 'https://x.com' });
    expect(sess.source).toBe('api_token');
    expect(sess.token.kind).toBe('bearer');
    expect(sess.token.reveal()).toBe('tok_abc');
    expect(sess.userIdentity.displayName).toBe('Test');
  });

  it('throws AuthConfigError if credential store returns null', async () => {
    const s = new ApiTokenStrategy({
      tokenRef: 'env:NONE',
      credentialStore: { ...credStore, get: async () => null },
      whoami,
    });
    await expect(
      s.authenticate({ profile: 'p1', baseUrl: 'https://x.com' }),
    ).rejects.toThrow(/token/i);
  });

  it('canRefresh is false (API tokens are long-lived)', () => {
    const s = new ApiTokenStrategy({ tokenRef: 'env:TOK', credentialStore: credStore, whoami });
    expect(s.canRefresh()).toBe(false);
  });
});
