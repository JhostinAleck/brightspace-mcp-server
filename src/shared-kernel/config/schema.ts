import { z } from 'zod';

export const AuthStrategyKindSchema = z.enum([
  'auto',
  'api_token',
  'browser',
  'oauth',
  'session_cookie',
  'headless',
]);

export const ProfileSchema = z.object({
  extends: z.string().optional(),
  base_url: z.url().optional(),
  auth: z.object({
    strategy: AuthStrategyKindSchema.default('auto'),
    fallbacks: z.array(AuthStrategyKindSchema).default([]),
    api_token: z.object({ token_ref: z.string() }).optional(),
  }),
  session: z
    .object({
      cache_backend: z.enum(['memory', 'file', 'redis']).default('memory'),
      preemptive_refresh_seconds: z.number().int().nonnegative().default(300),
    })
    .default({ cache_backend: 'memory', preemptive_refresh_seconds: 300 }),
});

export const LoggingSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const ConfigSchema = z.object({
  default_profile: z.string(),
  profiles: z.record(z.string(), ProfileSchema),
  logging: LoggingSchema.default({ level: 'info' }),
});

export type Config = z.infer<typeof ConfigSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
