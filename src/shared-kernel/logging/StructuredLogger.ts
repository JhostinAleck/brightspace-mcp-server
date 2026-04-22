import type { Logger, LogLevel } from './Logger.js';
import { redactSecrets } from './redactor.js';

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class StructuredLogger implements Logger {
  constructor(
    private readonly minLevel: LogLevel = 'info',
    private readonly write: (line: string) => void = (l) => process.stderr.write(l + '\n'),
  ) {}

  private log(
    level: LogLevel,
    message: string,
    context: Record<string, unknown> | undefined,
  ): void {
    if (LEVELS[level] < LEVELS[this.minLevel]) return;
    const entry = JSON.stringify({ ts: new Date().toISOString(), level, message, ...context });
    this.write(redactSecrets(entry));
  }

  debug(m: string, c?: Record<string, unknown>): void {
    this.log('debug', m, c);
  }
  info(m: string, c?: Record<string, unknown>): void {
    this.log('info', m, c);
  }
  warn(m: string, c?: Record<string, unknown>): void {
    this.log('warn', m, c);
  }
  error(m: string, c?: Record<string, unknown>): void {
    this.log('error', m, c);
  }
}
