import { describe, it, expect } from 'vitest';
import { loadConfig } from '@/shared-kernel/config/loader.js';

describe('loadConfig', () => {
  it('returns defaults when no file and no env', () => {
    const cfg = loadConfig({ fileContent: null, env: {}, cliOverrides: {} });
    expect(cfg.default_profile).toBe('default');
  });

  it('applies YAML file overrides', () => {
    const yaml = `default_profile: purdue
profiles:
  purdue:
    auth:
      strategy: api_token
      api_token: { token_ref: env:TOK }
    base_url: https://purdue.brightspace.com`;
    const cfg = loadConfig({ fileContent: yaml, env: {}, cliOverrides: {} });
    expect(cfg.default_profile).toBe('purdue');
    expect(cfg.profiles.purdue?.base_url).toBe('https://purdue.brightspace.com');
  });

  it('CLI overrides beat file', () => {
    const yaml = `default_profile: foo\nprofiles:\n  foo:\n    auth: { strategy: api_token, api_token: { token_ref: env:T } }`;
    const cfg = loadConfig({
      fileContent: yaml,
      env: {},
      cliOverrides: { default_profile: 'bar' },
    });
    // bar must exist in profiles (we only override the default_profile pointer, not profile contents)
    expect(cfg.default_profile).toBe('bar');
  });
});
