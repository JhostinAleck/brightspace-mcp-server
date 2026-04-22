import { describe, it, expect } from 'vitest';
import { ConfigSchema } from '@/shared-kernel/config/schema.js';
import { DEFAULT_CONFIG } from '@/shared-kernel/config/defaults.js';

describe('ConfigSchema', () => {
  it('accepts DEFAULT_CONFIG', () => {
    expect(() => ConfigSchema.parse(DEFAULT_CONFIG)).not.toThrow();
  });
  it('requires default_profile', () => {
    const bad: Record<string, unknown> = { ...DEFAULT_CONFIG };
    delete bad['default_profile'];
    expect(() => ConfigSchema.parse(bad)).toThrow();
  });
  it('rejects unknown auth strategy', () => {
    const bad = structuredClone(DEFAULT_CONFIG) as unknown as {
      profiles: { default: { auth: { strategy: string } } };
    };
    bad.profiles.default.auth.strategy = 'magic';
    expect(() => ConfigSchema.parse(bad)).toThrow();
  });
});
