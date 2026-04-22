import { describe, it, expect } from 'vitest';
import { StructuredLogger } from '@/shared-kernel/logging/StructuredLogger';

function capturingLogger(minLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
  const lines: string[] = [];
  const logger = new StructuredLogger(minLevel, (line) => lines.push(line));
  return { logger, lines };
}

describe('StructuredLogger', () => {
  it('writes JSON with ts, level, message', () => {
    const { logger, lines } = capturingLogger();
    logger.info('hello');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('hello');
    expect(typeof parsed.ts).toBe('string');
  });

  it('filters below minLevel', () => {
    const { logger, lines } = capturingLogger('warn');
    logger.debug('dbg');
    logger.info('nfo');
    logger.warn('wrn');
    logger.error('err');
    expect(lines).toHaveLength(2);
    expect(JSON.parse(lines[0]!).level).toBe('warn');
    expect(JSON.parse(lines[1]!).level).toBe('error');
  });

  it('merges context into the JSON entry', () => {
    const { logger, lines } = capturingLogger();
    logger.info('action', { userId: 7, profile: 'default' });
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.userId).toBe(7);
    expect(parsed.profile).toBe('default');
  });

  it('redacts Bearer tokens in context values (end-to-end)', () => {
    const { logger, lines } = capturingLogger();
    logger.info('request', { authHeader: 'Bearer tok_abc.def' });
    expect(lines[0]).not.toContain('tok_abc');
    expect(lines[0]).toContain('[REDACTED]');
  });

  it('redacts JSON-shaped Cookie in context values', () => {
    const { logger, lines } = capturingLogger();
    logger.info('request', { Cookie: 'sessionid=abc' });
    expect(lines[0]).not.toContain('sessionid=abc');
    expect(lines[0]).toContain('[REDACTED]');
  });
});
