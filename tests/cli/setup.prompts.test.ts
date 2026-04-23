import { describe, expect, it, vi } from 'vitest';

// Import the prompt functions but mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  password: vi.fn(),
  confirm: vi.fn(),
}));

describe('validation helpers (pure, no prompts involved)', () => {
  it('validateBaseUrl accepts https URLs', async () => {
    const { validateBaseUrl } = await import('@/cli/commands/setup/prompts.js');
    expect(validateBaseUrl('https://school.brightspace.com')).toBe(true);
  });

  it('validateBaseUrl rejects http (non-localhost)', async () => {
    const { validateBaseUrl } = await import('@/cli/commands/setup/prompts.js');
    const result = validateBaseUrl('http://school.brightspace.com');
    expect(result).not.toBe(true);
    expect(typeof result).toBe('string');
  });

  it('validateBaseUrl rejects a non-URL string', async () => {
    const { validateBaseUrl } = await import('@/cli/commands/setup/prompts.js');
    const result = validateBaseUrl('not a url');
    expect(result).not.toBe(true);
  });

  it('validateTotpSecret accepts base32', async () => {
    const { validateTotpSecret } = await import('@/cli/commands/setup/prompts.js');
    expect(validateTotpSecret('JBSWY3DPEHPK3PXP')).toBe(true);
  });

  it('validateTotpSecret rejects strings with non-base32 chars', async () => {
    const { validateTotpSecret } = await import('@/cli/commands/setup/prompts.js');
    const result = validateTotpSecret('INVALID0!?');
    expect(result).not.toBe(true);
  });
});
