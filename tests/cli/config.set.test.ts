import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parse as parseYaml } from 'yaml';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runConfigSet } from '@/cli/commands/config.js';

describe('runConfigSet', () => {
  let dir: string;
  let configPath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'bmcp-cfg-set-'));
    configPath = join(dir, 'config.yaml');
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('sets a nested path and writes back valid YAML', async () => {
    writeFileSync(
      configPath,
      `default_profile: p1
profiles:
  p1:
    base_url: https://old.brightspace.com
    auth:
      strategy: api_token
      api_token: { token_ref: env:T }
`,
      'utf8',
    );
    await runConfigSet(
      'profiles.p1.base_url',
      'https://new.brightspace.com',
      { config: configPath },
    );
    const updated = parseYaml(readFileSync(configPath, 'utf8')) as {
      profiles: { p1: { base_url: string } };
    };
    expect(updated.profiles.p1.base_url).toBe('https://new.brightspace.com');
  });

  it('refuses to write if resulting config fails schema validation', async () => {
    writeFileSync(
      configPath,
      `default_profile: p1
profiles:
  p1:
    base_url: https://school.brightspace.com
    auth:
      strategy: api_token
      api_token: { token_ref: env:T }
`,
      'utf8',
    );
    // base_url must be a URL; set to garbage and expect failure
    await expect(
      runConfigSet('profiles.p1.base_url', 'not-a-url', { config: configPath }),
    ).rejects.toThrow();
    // original file should be unchanged
    const unchanged = parseYaml(readFileSync(configPath, 'utf8')) as {
      profiles: { p1: { base_url: string } };
    };
    expect(unchanged.profiles.p1.base_url).toBe('https://school.brightspace.com');
  });
});
