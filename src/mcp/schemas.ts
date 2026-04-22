import { z } from 'zod';

export const checkAuthSchema = z.object({}).strict();

export const listMyCoursesSchema = z
  .object({
    active_only: z.boolean().default(true),
    format: z.enum(['compact', 'detailed']).default('compact'),
    limit: z.number().int().positive().max(200).default(50),
  })
  .strict();

export type ListMyCoursesInput = z.infer<typeof listMyCoursesSchema>;
