import { describe, it, expect, beforeEach } from 'vitest';
import { SecretResolver } from '@/shared-kernel/config/SecretResolver';

describe('SecretResolver', () => {
  let env: Record<string, string>;
  beforeEach(() => {
    env = {};
  });

  it('resolves env:VAR references', async () => {
    env.FOO = 'bar';
    const r = new SecretResolver({ env, allowLiteral: false });
    expect(await r.resolve('env:FOO')).toBe('bar');
  });

  it('returns null for missing env var', async () => {
    const r = new SecretResolver({ env, allowLiteral: false });
    expect(await r.resolve('env:MISSING')).toBeNull();
  });

  it('rejects literal: refs when allowLiteral is false', async () => {
    const r = new SecretResolver({ env, allowLiteral: false });
    await expect(r.resolve('literal:secret')).rejects.toThrow();
  });

  it('accepts literal: refs when allowLiteral is true', async () => {
    const r = new SecretResolver({ env, allowLiteral: true });
    expect(await r.resolve('literal:secret')).toBe('secret');
  });

  it('throws on unknown scheme', async () => {
    const r = new SecretResolver({ env, allowLiteral: false });
    await expect(r.resolve('foo:bar')).rejects.toThrow();
  });

  it('passes keychain: refs to the credential store', async () => {
    const resolver = new SecretResolver({
      env: {},
      allowLiteral: false,
      credentialStore: {
        async get(key) {
          return key === 'keychain:svc/acc'
            ? { reveal: () => 'kc_val', toString: () => '[REDACTED]', toJSON: () => '[REDACTED]' } as never
            : null;
        },
        async set() {},
        async delete() {},
      },
    });
    expect(await resolver.resolve('keychain:svc/acc')).toBe('kc_val');
  });

  it('passes file: refs to the credential store', async () => {
    const resolver = new SecretResolver({
      env: {},
      allowLiteral: false,
      credentialStore: {
        async get(key) {
          return key === 'file:creds/x'
            ? { reveal: () => 'file_val', toString: () => '[REDACTED]', toJSON: () => '[REDACTED]' } as never
            : null;
        },
        async set() {},
        async delete() {},
      },
    });
    expect(await resolver.resolve('file:creds/x')).toBe('file_val');
  });

  it('throws helpful error when credential store missing for keychain:/file:', async () => {
    const resolver = new SecretResolver({ env: {}, allowLiteral: false });
    await expect(resolver.resolve('keychain:svc/acc')).rejects.toThrow(/credential store/i);
  });
});
