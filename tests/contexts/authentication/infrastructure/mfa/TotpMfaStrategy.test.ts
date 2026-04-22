import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TotpMfaStrategy } from '@/contexts/authentication/infrastructure/mfa/TotpMfaStrategy.js';
import { SecretValue } from '@/contexts/authentication/domain/SecretValue.js';

// RFC 6238 Appendix B test vector: secret "12345678901234567890" (ASCII)
// encoded as base32 is 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'
// At Unix epoch time = 59, HOTP code (8-digit SHA-1) is '94287082'.
// The 6-digit truncation is '287082'.
const RFC_BASE32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('TotpMfaStrategy', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('generates RFC 6238 6-digit code at t=59', async () => {
    vi.setSystemTime(new Date(59_000));
    const strategy = new TotpMfaStrategy({
      secret: new SecretValue(RFC_BASE32),
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    });
    const resp = await strategy.solve({ kind: 'totp_code' });
    expect(resp.code).toBe('287082');
  });

  it('regenerates different code as time advances across a period', async () => {
    vi.setSystemTime(new Date(30_000)); // period 1
    const strategy = new TotpMfaStrategy({
      secret: new SecretValue(RFC_BASE32),
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    });
    const a = (await strategy.solve({ kind: 'totp_code' })).code;
    vi.setSystemTime(new Date(61_000)); // period 2
    const b = (await strategy.solve({ kind: 'totp_code' })).code;
    expect(a).not.toBe(b);
  });

  it('rejects non-totp_code challenge kinds', async () => {
    const strategy = new TotpMfaStrategy({
      secret: new SecretValue(RFC_BASE32),
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
    });
    await expect(
      strategy.solve({ kind: 'duo_push' }),
    ).rejects.toThrow(/totp_code/i);
  });
});
