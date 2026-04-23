import { describe, expect, it } from 'vitest';

import { chooseSecretRef } from '@/cli/commands/setup/credentials.js';

describe('chooseSecretRef', () => {
  it('returns env ref if env strategy chosen', () => {
    expect(chooseSecretRef({ strategy: 'env', varName: 'MY_TOKEN' })).toBe('env:MY_TOKEN');
  });

  it('returns file ref if file strategy chosen', () => {
    expect(chooseSecretRef({ strategy: 'file', path: '/abs/secret' })).toBe('file:/abs/secret');
  });

  it('returns keychain ref if keychain strategy chosen', () => {
    expect(chooseSecretRef({ strategy: 'keychain', service: 'bmcp', key: 'api' })).toBe(
      'keychain:bmcp/api',
    );
  });

  it('throws on unknown strategy', () => {
    // @ts-expect-error -- deliberately bad input
    expect(() => chooseSecretRef({ strategy: 'nope' })).toThrow();
  });
});
