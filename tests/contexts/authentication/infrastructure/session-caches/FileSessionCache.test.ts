import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileSessionCache } from '@/contexts/authentication/infrastructure/session-caches/FileSessionCache';
import { AccessToken } from '@/contexts/authentication/domain/AccessToken';
import { UserId } from '@/shared-kernel/types/UserId';
import type { Session } from '@/contexts/authentication/domain/Session';

const makeSession = (profile: string, expiresAt: Date): Session => ({
  token: AccessToken.bearer('tok'),
  profile,
  issuedAt: new Date(1_000_000),
  expiresAt,
  source: 'api_token',
  userIdentity: { userId: UserId.of(1), displayName: 'U', uniqueName: 'u@x' },
});

describe('FileSessionCache', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'sess-'));
    return () => rmSync(dir, { recursive: true, force: true });
  });

  it('stores and retrieves a valid session across instances', async () => {
    const path = join(dir, 'sessions.json');
    const a = new FileSessionCache({ path });
    await a.save('p', makeSession('p', new Date(Date.now() + 60_000)));
    const b = new FileSessionCache({ path });
    const loaded = await b.get('p');
    expect(loaded?.token.reveal()).toBe('tok');
    expect(loaded?.profile).toBe('p');
  });

  it('returns null for expired session and removes it from disk', async () => {
    const path = join(dir, 'sessions.json');
    const cache = new FileSessionCache({ path });
    await cache.save('p', makeSession('p', new Date(Date.now() - 1)));
    expect(await cache.get('p')).toBeNull();
    const again = await cache.get('p');
    expect(again).toBeNull();
  });

  it('invalidate removes entry but keeps other entries', async () => {
    const path = join(dir, 'sessions.json');
    const cache = new FileSessionCache({ path });
    await cache.save('a', makeSession('a', new Date(Date.now() + 60_000)));
    await cache.save('b', makeSession('b', new Date(Date.now() + 60_000)));
    await cache.invalidate('a');
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).not.toBeNull();
  });

  it('writes file with 0600 permissions on POSIX', async () => {
    if (process.platform === 'win32') return;
    const path = join(dir, 'sessions.json');
    const cache = new FileSessionCache({ path });
    await cache.save('p', makeSession('p', new Date(Date.now() + 60_000)));
    expect(existsSync(path)).toBe(true);
    const { statSync } = await import('node:fs');
    const mode = statSync(path).mode & 0o777;
    expect(mode).toBe(0o600);
  });
});
