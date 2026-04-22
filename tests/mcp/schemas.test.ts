import { describe, it, expect } from 'vitest';
import { listMyCoursesSchema, checkAuthSchema } from '@/mcp/schemas.js';

describe('listMyCoursesSchema', () => {
  it('defaults active_only to true', () => {
    expect(listMyCoursesSchema.parse({}).active_only).toBe(true);
  });
  it('accepts active_only: false', () => {
    expect(listMyCoursesSchema.parse({ active_only: false }).active_only).toBe(false);
  });
  it('accepts format enum', () => {
    expect(listMyCoursesSchema.parse({ format: 'detailed' }).format).toBe('detailed');
  });
  it('rejects unknown format', () => {
    expect(() => listMyCoursesSchema.parse({ format: 'bogus' })).toThrow();
  });
});

describe('checkAuthSchema', () => {
  it('accepts empty input', () => {
    expect(() => checkAuthSchema.parse({})).not.toThrow();
  });
});
