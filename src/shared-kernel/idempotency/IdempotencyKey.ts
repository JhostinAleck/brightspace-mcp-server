import type { Brand } from '@/shared-kernel/types/Brand.js';

export type IdempotencyKey = Brand<string, 'IdempotencyKey'>;

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

export function createIdempotencyKey(value: string): IdempotencyKey {
  if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    throw new Error(
      `IdempotencyKey must be ${MIN_LENGTH}-${MAX_LENGTH} chars (got ${value.length})`,
    );
  }
  return value as IdempotencyKey;
}
