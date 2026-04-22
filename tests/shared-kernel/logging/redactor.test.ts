import { describe, it, expect } from 'vitest';
import { redactSecrets } from '@/shared-kernel/logging/redactor';

describe('redactSecrets', () => {
  it('redacts base32 TOTP-shaped secrets (16-32 chars A-Z,2-7)', () => {
    expect(redactSecrets('secret=JBSWY3DPEHPK3PXP')).toBe('secret=[REDACTED]');
  });
  it('redacts Bearer tokens', () => {
    expect(redactSecrets('Authorization: Bearer abc.def.ghi')).toContain('Bearer [REDACTED]');
  });
  it('redacts Cookie headers', () => {
    expect(redactSecrets('Cookie: session=xyz; other=val')).toContain('Cookie: [REDACTED]');
  });
  it('leaves regular text alone', () => {
    expect(redactSecrets('just some text')).toBe('just some text');
  });
});
