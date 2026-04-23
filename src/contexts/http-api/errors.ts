import { InfrastructureError } from '@/shared-kernel/errors/InfrastructureError.js';

export class D2lApiError extends InfrastructureError {
  readonly code: string;
  constructor(
    readonly status: number,
    readonly path: string,
    readonly body: string,
    cause?: Error,
  ) {
    super(`D2L API ${status} on ${path}: ${body.slice(0, 200)}`, cause);
    this.code = `HTTP_${status}`;
  }
}

export class NetworkError extends InfrastructureError {
  readonly code = 'NETWORK_ERROR';
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class RateLimitedError extends InfrastructureError {
  readonly code = 'HTTP_429';
  constructor(
    readonly path: string,
    readonly retryAfterMs: number | null,
    cause?: Error,
  ) {
    super(`Rate limited on ${path} (Retry-After=${retryAfterMs === null ? 'unset' : `${retryAfterMs}ms`})`, cause);
  }
}
